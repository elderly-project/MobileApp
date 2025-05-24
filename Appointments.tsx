import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  getCurrentUser,
  getUserAppointments,
} from './utils/supabase';

export default function Appointments() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) throw new Error('User not found');
      const data = await getUserAppointments(user.id);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString() : 'Not specified';
  const formatTime = (d: string | null) =>
    d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await loadAppointments();
            setRefreshing(false);
          }}
          colors={['#3B82F6']}
        />
      }
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        {appointments.length === 0 ? (
          <Text style={styles.emptyMessage}>No appointments scheduled.</Text>
        ) : (
          appointments.map((appointment) => (
            <View key={appointment.id} style={styles.card}>
              <Text style={styles.cardTitle}>{appointment.title}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardDetail}>Date: {formatDate(appointment.appointment_date)}</Text>
                <Text style={styles.cardDetail}>Time: {formatTime(appointment.appointment_date)}</Text>
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
  section: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
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
});
