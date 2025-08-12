import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { validateCourse } from '@/lib/icalService';

interface CourseSetupProps {
  onCourseSelected: (course: string) => void;
}

export default function CourseSetup({
  onCourseSelected,
}: CourseSetupProps) {
  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);

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
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Stundenplan</Text>
        <Text style={styles.subtitle}>
          Geben Sie Ihren Kursnamen ein, um Ihren Stundenplan zu
          laden.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.courseInput}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Kursname eingeben"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[
              styles.validateButton,
              isValidating && styles.validateButtonDisabled,
            ]}
            onPress={handleValidateAndSetCourse}
            disabled={isValidating}
          >
            {isValidating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.validateButtonText}>Laden</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
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
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  validateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  validateButtonDisabled: {
    backgroundColor: '#999',
  },
  validateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
