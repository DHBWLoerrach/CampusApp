import { BlockPlanErrorCode } from '@/lib/blockPlanError';
import { buildBlockPlanUrl, getBlockPlan } from '@/lib/blockPlanApi';

const PLAN_PAYLOAD = {
  course: { code: 'TIF26A' },
  semesters: [
    {
      number: 1,
      phases: [
        { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
      ],
    },
  ],
};

function mockResponse(overrides: Partial<Response> & { json?: unknown }) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => PLAN_PAYLOAD,
    ...overrides,
  } as unknown as Response;
}

describe('buildBlockPlanUrl', () => {
  it('builds the request URL from the course template', () => {
    expect(
      buildBlockPlanUrl('wwi25a-am', 'https://example.test/{course}.json')
    ).toBe('https://example.test/WWI25A.json');
  });

  it('is idempotent for an already normalized course', () => {
    expect(
      buildBlockPlanUrl('WWI25A', 'https://example.test/{course}.json')
    ).toBe('https://example.test/WWI25A.json');
  });

  it('escapes course codes that are not URL safe', () => {
    expect(
      buildBlockPlanUrl('tif 26/a', 'https://example.test/{course}.json')
    ).toBe('https://example.test/TIF%2026%2FA.json');
  });
});

describe('getBlockPlan', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the parsed plan on success', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse({}));

    await expect(getBlockPlan('TIF26A')).resolves.toEqual({
      ...PLAN_PAYLOAD,
      isPartial: false,
    });
  });

  it('rejects a blank course before touching the network', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    await expect(getBlockPlan('   ')).rejects.toMatchObject({
      code: BlockPlanErrorCode.InvalidCourse,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('classifies a 404 as NotFound rather than a generic HTTP error', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        mockResponse({ ok: false, status: 404, statusText: 'Not Found' })
      );

    await expect(getBlockPlan('TIF26A')).rejects.toMatchObject({
      code: BlockPlanErrorCode.NotFound,
      status: 404,
      statusText: 'Not Found',
    });
  });

  it('classifies other error statuses as HTTP errors', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        mockResponse({ ok: false, status: 500, statusText: 'Server Error' })
      );

    await expect(getBlockPlan('TIF26A')).rejects.toMatchObject({
      code: BlockPlanErrorCode.Http,
      status: 500,
    });
  });

  it('classifies a failed request as a network error', async () => {
    const cause = new TypeError('Network request failed');
    jest.spyOn(global, 'fetch').mockRejectedValue(cause);

    await expect(getBlockPlan('TIF26A')).rejects.toMatchObject({
      code: BlockPlanErrorCode.Network,
      cause,
    });
  });

  it('passes an aborted request through unchanged', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    jest.spyOn(global, 'fetch').mockRejectedValue(abortError);

    await expect(getBlockPlan('TIF26A')).rejects.toBe(abortError);
  });

  it('passes an abort during the body read through unchanged', async () => {
    // The abort can land while the body is still being read. That is a
    // cancelled request, not a malformed payload.
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    jest.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({
        json: async () => {
          throw abortError;
        },
      })
    );

    await expect(getBlockPlan('TIF26A')).rejects.toBe(abortError);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('classifies invalid response JSON as a parse error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      })
    );

    await expect(getBlockPlan('TIF26A')).rejects.toMatchObject({
      code: BlockPlanErrorCode.Parse,
    });
  });

  it('rejects a plan that belongs to a different course', async () => {
    // A misconfigured backend or mock answering with a neighbouring course must
    // never be shown — and above all never be cached — under the requested one.
    jest.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({
        json: async () => ({ ...PLAN_PAYLOAD, course: { code: 'TIF26B' } }),
      })
    );

    await expect(getBlockPlan('TIF26A')).rejects.toMatchObject({
      code: BlockPlanErrorCode.Parse,
    });
  });

  it('accepts the alias spelling of the requested course', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({
        json: async () => ({ ...PLAN_PAYLOAD, course: { code: 'wwi25a-am' } }),
      })
    );

    await expect(getBlockPlan('WWI25A')).resolves.toMatchObject({
      course: { code: 'wwi25a-am' },
    });
  });

  it('classifies a well-formed response without usable phases as a parse error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({
        json: async () => ({ course: { code: 'TIF26A' }, semesters: [] }),
      })
    );

    await expect(getBlockPlan('TIF26A')).rejects.toMatchObject({
      code: BlockPlanErrorCode.Parse,
    });
  });
});
