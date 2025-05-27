import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { supabase, getCurrentUser } from '../utils/supabase';

interface EditProfileProps {
  onProfileUpdated: () => void;
  onCancel: () => void;
  currentProfile: any;
}

export default function EditProfile({ onProfileUpdated, onCancel, currentProfile }: EditProfileProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    emergencyContact: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    allergies: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with current profile data
  useEffect(() => {
    if (currentProfile) {
      setFormData({
        fullName: currentProfile.full_name || '',
        dateOfBirth: currentProfile.date_of_birth || '',
        phoneNumber: currentProfile.phone_number || '',
        emergencyContact: currentProfile.emergency_contact || '',
        emergencyContactPhone: currentProfile.emergency_contact_phone || '',
        medicalConditions: currentProfile.medical_conditions ? currentProfile.medical_conditions.join(', ') : '',
        allergies: currentProfile.allergies ? currentProfile.allergies.join(', ') : ''
      });
    }
  }, [currentProfile]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const { error } = await supabase.from('user_profiles').upsert({
        id: user.id,
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth || null,
        phone_number: formData.phoneNumber || null,
        emergency_contact: formData.emergencyContact || null,
        emergency_contact_phone: formData.emergencyContactPhone || null,
        medical_conditions: formData.medicalConditions 
          ? formData.medicalConditions.split(',').map(item => item.trim()).filter(item => item)
          : [],
        allergies: formData.allergies 
          ? formData.allergies.split(',').map(item => item.trim()).filter(item => item)
          : []
      });
      
      if (error) {
        throw error;
      }
      
      Alert.alert('Success', 'Profile updated successfully!');
      onProfileUpdated();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onCancel}
        >
          <ArrowLeft size={24} color="#1E40AF" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.form}>
        <Text style={styles.subtitle}>
          Update your health profile information
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={formData.fullName}
            onChangeText={(value) => handleChange('fullName', value)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.dateOfBirth}
            onChangeText={(value) => handleChange('dateOfBirth', value)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            onChangeText={(value) => handleChange('phoneNumber', value)}
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Emergency Contact Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter emergency contact name"
            value={formData.emergencyContact}
            onChangeText={(value) => handleChange('emergencyContact', value)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Emergency Contact Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter emergency contact phone"
            value={formData.emergencyContactPhone}
            onChangeText={(value) => handleChange('emergencyContactPhone', value)}
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medical Conditions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Diabetes, Hypertension, etc. (comma separated)"
            value={formData.medicalConditions}
            onChangeText={(value) => handleChange('medicalConditions', value)}
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Allergies</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Penicillin, Peanuts, etc. (comma separated)"
            value={formData.allergies}
            onChangeText={(value) => handleChange('allergies', value)}
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#DBEAFE',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    flex: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 0.48,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  placeholder: {
    width: 40,
  },
}); 