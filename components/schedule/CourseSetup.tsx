import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { validateCourse } from '@/lib/icalService';
import { useCourseContext } from '@/context/CourseContext';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface CourseSetupProps {
  onCourseSelected: (course: string) => void;
}

export default function CourseSetup({
  onCourseSelected,
}: CourseSetupProps) {
  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { previousCourses, removeCourseFromHistory } =
    useCourseContext();

  // Resolve theme-aware colors
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const inputBgColor = useThemeColor({}, 'dayNumberContainer');
  const placeholderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  // Disabled button uses same tint color with reduced opacity (see Welcome screen)

  // Keep previous courses sorted ascending for display
  const sortedPreviousCourses = useMemo(
    () =>
      [...previousCourses].sort((a, b) =>
        a.localeCompare(b, 'de', {
          sensitivity: 'base',
          numeric: true,
        })
      ),
    [previousCourses]
  );

  const handleValidateAndSetCourse = async () => {
    if (!inputValue.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie einen Kursnamen ein.');
      return;
    }

    // Prevent multiple validations and disable the button immediately
    if (isValidating) return;
    setIsValidating(true);

    try {
      const isValid = await validateCourse(inputValue.trim());
      if (isValid) {
        onCourseSelected(inputValue.trim());
      } else {
        Alert.alert(
          'Ungültiger Kurs',
          `Der Kurs "${inputValue
            .trim()
            .toUpperCase()}" konnte nicht gefunden werden. Bitte überprüfen Sie den Namen.`
        );
      }
    } catch {
      Alert.alert(
        'Fehler',
        'Bei der Validierung des Kurses ist ein Fehler aufgetreten.'
      );
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <View style={styles.contentContainer}>
            <View style={styles.content}>
              <View style={styles.inputContainer}>
                {/* Input with trailing action button inside */}
                <View
                  style={[
                    styles.inputWrapper,
                    { borderColor, backgroundColor: inputBgColor },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.courseInput,
                      {
                        color: textColor,
                      },
                    ]}
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder="Kursname eingeben"
                    placeholderTextColor={placeholderColor}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={handleValidateAndSetCourse}
                  />
                  {(() => {
                    const isInputEmpty =
                      inputValue.trim().length === 0;
                    const isButtonDisabled =
                      isValidating || isInputEmpty;
                    const iconColor = isButtonDisabled
                      ? placeholderColor
                      : tintColor;
                    return (
                      <TouchableOpacity
                        onPress={handleValidateAndSetCourse}
                        disabled={isButtonDisabled}
                        accessibilityRole="button"
                        accessibilityLabel="Kurs anzeigen"
                        accessibilityHint="Tippen, um den eingegebenen Kurs zu prüfen und anzuzeigen"
                        accessibilityState={{
                          disabled: isButtonDisabled,
                          busy: isValidating,
                        }}
                        style={styles.trailingAction}
                        hitSlop={8}
                      >
                        {isValidating ? (
                          <ActivityIndicator
                            size="small"
                            color={iconColor}
                          />
                        ) : (
                          <IconSymbol
                            name="magnifyingglass"
                            size={22}
                            color={iconColor}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })()}
                </View>
              </View>

              {previousCourses.length > 0 && (
                <View style={styles.historySection}>
                  <ThemedText
                    type="subtitle"
                    style={styles.historyTitle}
                  >
                    Zuletzt angezeigt
                  </ThemedText>
                  <ScrollView
                    style={styles.historyScroll}
                    contentContainerStyle={styles.historyList}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                  >
                    {sortedPreviousCourses.map((course) => (
                      <View
                        key={course}
                        style={[styles.historyItem, { borderColor }]}
                      >
                        <TouchableOpacity
                          style={styles.historyItemButton}
                          onPress={() => {
                            Keyboard.dismiss();
                            onCourseSelected(course);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Kurs ${course} auswählen`}
                        >
                          <ThemedText style={styles.historyItemText}>
                            {course}
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert(
                              'Entfernen bestätigen',
                              `Möchten Sie den Kurs "${course}" aus der Liste entfernen?`,
                              [
                                {
                                  text: 'Abbrechen',
                                  style: 'cancel',
                                },
                                {
                                  text: 'Entfernen',
                                  style: 'destructive',
                                  onPress: () =>
                                    removeCourseFromHistory(course),
                                },
                              ]
                            );
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Kurs ${course} aus Liste entfernen`}
                          hitSlop={8}
                          style={styles.removeButton}
                        >
                          <IconSymbol
                            name="xmark.circle.fill"
                            size={22}
                            color={placeholderColor}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: { flex: 1 },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    height: 54,
    paddingLeft: 16,
    // Reserve space for the trailing action
    paddingRight: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 18,
  },
  trailingAction: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
  },
  historySection: {
    marginTop: 28,
    width: '100%',
    maxWidth: 400,
    flex: 1,
    minHeight: 0,
  },
  historyScroll: {
    flex: 1,
  },
  historyTitle: {
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  historyItemButton: {
    flex: 1,
  },
  historyItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: 12,
  },
});
