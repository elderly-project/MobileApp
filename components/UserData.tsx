import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { supabase, getCurrentUser, getUserProfile, getUserMedications, getUserAppointments } from '../utils/supabase';
import AddAppointment from './AddAppointment';
import PrescriptionUpload from './PrescriptionUpload';
import EditProfile from './EditProfile';

interface UserDataProps {
  onSignOut?: () => void;
  show?: 'appointments' | 'medications' | 'profile';
}

export default function UserData({ onSignOut, show }: UserDataProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showPrescriptionUpload, setShowPrescriptionUpload] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [userData, setUserData] = useState<{
    profile: any;
    medications: any[];
    appointments: any[];
  }>({
    profile: null,
    medications: [],
    appointments: [],
  });

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = await getCurrentUser();
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get user profile
      const profile = await getUserProfile(user.id);
      
      // Get medications
      const medications = await getUserMedications(user.id);
      
      // Get appointments
      const appointments = await getUserAppointments(user.id);
      
      // Set all user data
      setUserData({
        profile,
        medications,
        appointments,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onSignOut?.();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAppointmentAdded = async () => {
    setShowAddAppointment(false);
    await loadUserData(); // Refresh the data to show the new appointment
  };

  const handleCancelAddAppointment = () => {
    setShowAddAppointment(false);
  };

  const handlePrescriptionUploadComplete = async () => {
    setShowPrescriptionUpload(false);
    await loadUserData(); // Refresh the data to show any new documents
  };

  const handleCancelPrescriptionUpload = () => {
    setShowPrescriptionUpload(false);
  };

  const handleProfileUpdated = async () => {
    setShowEditProfile(false);
    await loadUserData(); // Refresh the data to show the updated profile
  };

  const handleCancelEditProfile = () => {
    setShowEditProfile(false);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading your health data...</Text>
      </View>
    );
  }

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format time for display
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // If showing add appointment form
  if (showAddAppointment) {
    console.log('Rendering AddAppointment component');
    return (
      <AddAppointment 
        onAppointmentAdded={handleAppointmentAdded}
        onCancel={handleCancelAddAppointment}
      />
    );
  }

  // If showing prescription upload
  if (showPrescriptionUpload) {
    console.log('Rendering PrescriptionUpload component');
    return (
      <PrescriptionUpload 
        onUploadComplete={handlePrescriptionUploadComplete}
        onCancel={handleCancelPrescriptionUpload}
        medications={userData.medications}
      />
    );
  }

  // If showing edit profile form
  if (showEditProfile) {
    console.log('Rendering EditProfile component');
    return (
      <EditProfile 
        onProfileUpdated={handleProfileUpdated}
        onCancel={handleCancelEditProfile}
        currentProfile={userData.profile}
      />
    );
  }

  console.log('Rendering UserData component, showAddAppointment:', showAddAppointment);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#3B82F6']}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {userData.profile?.full_name || 'User'}
        </Text>
        {show === 'profile' && onSignOut && (
          <TouchableOpacity onPress={onSignOut} style={styles.signOutButton}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>


      {(!show || show == 'profile') && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                console.log('Edit Profile button pressed!');
                setShowEditProfile(true);
              }}
            >
              <Text style={styles.editButtonText}>✏️ Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Name:</Text>
            <Text style={styles.profileValue}>{userData.profile?.full_name || 'Not specified'}</Text>
          </View>
          {userData.profile?.date_of_birth && (
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Date of Birth:</Text>
              <Text style={styles.profileValue}>{formatDate(userData.profile.date_of_birth)}</Text>
            </View>
          )}
          {userData.profile?.phone_number && (
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Phone:</Text>
              <Text style={styles.profileValue}>{userData.profile.phone_number}</Text>
            </View>
          )}
          {userData.profile?.emergency_contact && (
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Emergency Contact:</Text>
              <Text style={styles.profileValue}>{userData.profile.emergency_contact}</Text>
            </View>
          )}
          {userData.profile?.emergency_contact_phone && (
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Emergency Phone:</Text>
              <Text style={styles.profileValue}>{userData.profile.emergency_contact_phone}</Text>
            </View>
          )}
          {userData.profile?.medical_conditions?.length > 0 && (
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Medical Conditions:</Text>
              <View>
                {userData.profile.medical_conditions.map((condition: string, index: number) => (
                  <Text key={index} style={styles.listItem}>• {condition}</Text>
                ))}
              </View>
            </View>
          )}
          {userData.profile?.allergies?.length > 0 && (
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Allergies:</Text>
              <View>
                {userData.profile.allergies.map((allergy: string, index: number) => (
                  <Text key={index} style={styles.listItem}>• {allergy}</Text>
                ))}
              </View>
            </View>
          )}
        </View>
      )}


      {(!show || show === 'medications') && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medications</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                console.log('Upload Prescription button pressed!');
                setShowPrescriptionUpload(true);
              }}
            >
              <Text style={styles.addButtonText}>📷 Upload Prescription</Text>
            </TouchableOpacity>
          </View>
          {userData.medications.length === 0 ? (
            <Text style={styles.emptyMessage}>No medications found.</Text>
          ) : (
            userData.medications.map((medication) => (
              <View key={medication.id} style={styles.card}>
                <Text style={styles.cardTitle}>{medication.name}</Text>
                <View style={styles.cardContent}>
                  <Text style={styles.cardDetail}>Dosage: {medication.dosage}</Text>
                  <Text style={styles.cardDetail}>Frequency: {medication.frequency}</Text>
                  {medication.start_date && (
                    <Text style={styles.cardDetail}>Start Date: {formatDate(medication.start_date)}</Text>
                  )}
                  {medication.end_date && (
                    <Text style={styles.cardDetail}>End Date: {formatDate(medication.end_date)}</Text>
                  )}
                  {medication.prescribing_doctor && (
                    <Text style={styles.cardDetail}>Doctor: {medication.prescribing_doctor}</Text>
                  )}
                  {medication.notes && (
                    <Text style={styles.cardDetail}>Notes: {medication.notes}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {(!show || show === 'appointments') && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                console.log('Schedule button pressed!');
                setShowAddAppointment(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Schedule</Text>
            </TouchableOpacity>
          </View>
          {userData.appointments.length === 0 ? (
            <Text style={styles.emptyMessage}>No appointments scheduled.</Text>
          ) : (
            userData.appointments.map((appointment) => (
              <View key={appointment.id} style={styles.card}>
                <Text style={styles.cardTitle}>{appointment.title}</Text>
                <View style={styles.cardContent}>
                  <Text style={styles.cardDetail}>
                    Date: {formatDate(appointment.appointment_date)}
                  </Text>
                  <Text style={styles.cardDetail}>
                    Time: {formatTime(appointment.appointment_date)}
                  </Text>
                  {appointment.doctor_name && (
                    <Text style={styles.cardDetail}>Doctor: {appointment.doctor_name}</Text>
                  )}
                  {appointment.location && (
                    <Text style={styles.cardDetail}>Location: {appointment.location}</Text>
                  )}
                  {appointment.notes && (
                    <Text style={styles.cardDetail}>Notes: {appointment.notes}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1E40AF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#DBEAFE',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  backButton: {
  padding: 6,
  borderRadius: 6,
  backgroundColor: '#3B82F6',
  marginRight: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#93C5FD',
  },
  signOutButtonText: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#93C5FD',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 0,
  },
  sectionTitleWithMargin: {
    marginBottom: 12,
  },
  profileItem: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  profileLabel: {
    fontWeight: 'bold',
    color: '#3B82F6',
    width: 120,
  },
  profileValue: {
    flex: 1,
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  cardContent: {
    paddingLeft: 8,
  },
  cardDetail: {
    color: '#4B5563',
    marginBottom: 4,
    fontSize: 14,
  },
  emptyMessage: {
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
  listItem: {
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  editButton: {
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 