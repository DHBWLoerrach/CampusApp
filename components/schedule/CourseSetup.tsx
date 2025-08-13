import { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { validateCourse } from '@/lib/icalService';

interface CourseSetupProps {
  onCourseSelected: (course: string) => void;
}

export default function CourseSetup({
  onCourseSelected,
}: CourseSetupProps) {
  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Resolve theme-aware colors
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const inputBgColor = useThemeColor({}, 'dayNumberContainer');
  const placeholderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const handleValidateAndSetCourse = async () => {
    if (!inputValue.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie einen Kursnamen ein.');
      return;
    }

    setIsValidating(true);
    try {
      const isValid = await validateCourse(inputValue.trim());
      if (isValid) {
        onCourseSelected(inputValue.trim());
        Alert.alert(
          'Erfolg',
          `Kurs "${inputValue.trim()}" wurde erfolgreich geladen.`
        );
      } else {
        Alert.alert(
          'Ungültiger Kurs',
          `Der Kurs "${inputValue.trim()}" konnte nicht gefunden werden. Bitte überprüfen Sie den Namen.`
        );
      }
    } catch (error) {
      Alert.alert(
        'Fehler',
        'Bei der Validierung des Kurses ist ein Fehler aufgetreten.'
      );
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Vorlesungsplan
        </ThemedText>
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
          />
          <TouchableOpacity
            style={[
              styles.validateButton,
              { backgroundColor: tintColor },
              isValidating && { backgroundColor: placeholderColor },
            ]}
            onPress={handleValidateAndSetCourse}
            disabled={isValidating}
          >
            {isValidating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.validateButtonText}>
                Laden
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  content: {
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
    maxWidth: 400,
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
  validateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
