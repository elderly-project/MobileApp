import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Minus, RotateCcw } from 'lucide-react-native';
import { useZoom } from '../contexts/ZoomContext';

interface ZoomControlsProps {
  style?: any;
}

export default function ZoomControls({ style }: ZoomControlsProps) {
  const { zoomLevel, zoomIn, zoomOut, resetZoom, getScaledSize } = useZoom();

  const zoomPercentage = Math.round(zoomLevel * 100);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { fontSize: getScaledSize(16) }]}>
        Text Size
      </Text>
      
      <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={[styles.zoomButton, styles.zoomOutButton]}
          onPress={zoomOut}
          disabled={zoomLevel <= 0.8}
          accessibilityLabel="Decrease text size"
          accessibilityHint="Makes text smaller"
        >
          <Minus size={getScaledSize(24)} color="#FFFFFF" strokeWidth={3} />
        </TouchableOpacity>
        
        <View style={styles.zoomDisplay}>
          <Text style={[styles.zoomText, { fontSize: getScaledSize(18) }]}>
            {zoomPercentage}%
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.zoomButton, styles.zoomInButton]}
          onPress={zoomIn}
          disabled={zoomLevel >= 2.0}
          accessibilityLabel="Increase text size"
          accessibilityHint="Makes text larger"
        >
          <Plus size={getScaledSize(24)} color="#FFFFFF" strokeWidth={3} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.resetButton}
        onPress={resetZoom}
        accessibilityLabel="Reset text size to normal"
        accessibilityHint="Returns text size to default"
      >
        <RotateCcw size={getScaledSize(16)} color="#3B82F6" />
        <Text style={[styles.resetText, { fontSize: getScaledSize(14) }]}>
          Reset
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#93C5FD',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    color: '#1E40AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  zoomButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoomOutButton: {
    backgroundColor: '#EF4444',
    marginRight: 20,
  },
  zoomInButton: {
    backgroundColor: '#10B981',
    marginLeft: 20,
  },
  zoomDisplay: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minWidth: 80,
    alignItems: 'center',
  },
  zoomText: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  resetText: {
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 8,
  },
}); 