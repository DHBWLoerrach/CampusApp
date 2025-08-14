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
                <TextInput
                  style={[
                    styles.courseInput,
                    {
                      color: textColor,
                      borderColor,
                      backgroundColor: inputBgColor,
                    },
                  ]}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder="Kursname eingeben"
                  placeholderTextColor={placeholderColor}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleValidateAndSetCourse}
                />
                {/** Disable button until text was entered */}
                {(() => {
                  const isInputEmpty = inputValue.trim().length === 0;
                  const isButtonDisabled =
                    isValidating || isInputEmpty;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.validateButton,
                        { backgroundColor: tintColor },
                        isButtonDisabled &&
                          styles.validateButtonDisabled,
                      ]}
                      onPress={handleValidateAndSetCourse}
                      disabled={isButtonDisabled}
                      accessibilityState={{
                        disabled: isButtonDisabled,
                      }}
                    >
                      {isValidating ? (
                        <ActivityIndicator
                          size="small"
                          color={textColor}
                        />
                      ) : (
                        <ThemedText style={styles.validateButtonText}>
                          Anzeigen
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  );
                })()}
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
                          onPress={() =>
                            removeCourseFromHistory(course)
                          }
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
  courseInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
  },
  validateButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  validateButtonDisabled: {
    opacity: 0.5,
  },
  validateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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
