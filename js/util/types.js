// @flow
'use strict';

export type Lecture = {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  location: ?string;
};

export type NewsItem = {
  imgUrl: ?string;
  heading: string;
  subheading: string;
  time: any;
}
