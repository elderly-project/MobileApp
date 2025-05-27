import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { supabase, getCurrentUser } from '../utils/supabase';

interface AddAppointmentProps {
  onAppointmentAdded: () => void;
  onCancel: () => void;
}

export default function AddAppointment({ onAppointmentAdded, onCancel }: AddAppointmentProps) {
  console.log('AddAppointment component rendered with props:', { onAppointmentAdded: !!onAppointmentAdded, onCancel: !!onCancel });
  
  const [formData, setFormData] = useState({
    title: '',
    doctorName: '',
    location: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter an appointment title');
      return;
    }

    if (!formData.appointmentDate.trim()) {
      Alert.alert('Error', 'Please enter an appointment date');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      // Combine date and time
      const dateTimeString = formData.appointmentDate && formData.appointmentTime
        ? `${formData.appointmentDate}T${formData.appointmentTime}`
        : formData.appointmentDate;
      
      const { error } = await supabase.from('appointments').insert({
        user_id: user.id,
        title: formData.title,
        doctor_name: formData.doctorName || null,
        location: formData.location || null,
        appointment_date: dateTimeString,
        notes: formData.notes || null
      });
      
      if (error) {
        throw error;
      }
      
      Alert.alert('Success', 'Appointment scheduled successfully!');
      onAppointmentAdded();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      Alert.alert('Error', 'Failed to schedule appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            console.log('Back arrow pressed');
            onCancel();
          }}
        >
          <ArrowLeft size={24} color="#1E40AF" />
        </TouchableOpacity>
        <Text style={styles.title}>Schedule New Appointment</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Appointment Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Annual Check-up, Follow-up Visit"
            value={formData.title}
            onChangeText={(value) => handleChange('title', value)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Doctor Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Dr. Smith"
            value={formData.doctorName}
            onChangeText={(value) => handleChange('doctorName', value)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Memorial Hospital, 123 Main Street"
            value={formData.location}
            onChangeText={(value) => handleChange('location', value)}
          />
        </View>
        
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.appointmentDate}
              onChangeText={(value) => handleChange('appointmentDate', value)}
            />
          </View>
          
          <View style={styles.halfInput}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              value={formData.appointmentTime}
              onChangeText={(value) => handleChange('appointmentTime', value)}
            />
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special instructions or things to remember"
            value={formData.notes}
            onChangeText={(value) => handleChange('notes', value)}
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={() => {
              console.log('Cancel button pressed');
              onCancel();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfInput: {
    flex: 0.48,
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