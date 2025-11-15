import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Button } from './Button';

interface Participant {
  id: string;
  name: string;
}

interface ParticipantsModalProps {
  visible: boolean;
  onClose: () => void;
  participants: Participant[];
  onSave: (participants: Participant[]) => void;
}

export const ParticipantsModal: React.FC<ParticipantsModalProps> = ({
  visible,
  onClose,
  participants,
  onSave,
}) => {
  const [localParticipants, setLocalParticipants] =
    useState<Participant[]>(participants);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const addParticipant = () => {
    if (newName.trim()) {
      const newParticipant: Participant = {
        id: Date.now().toString(),
        name: newName.trim(),
      };
      setLocalParticipants([...localParticipants, newParticipant]);
      setNewName('');
    }
  };

  const deleteParticipant = (id: string) => {
    setLocalParticipants(localParticipants.filter(p => p.id !== id));
  };

  const startEdit = (participant: Participant) => {
    setEditingId(participant.id);
    setEditingName(participant.name);
  };

  const saveEdit = () => {
    if (editingName.trim()) {
      setLocalParticipants(
        localParticipants.map(p =>
          p.id === editingId ? { ...p, name: editingName.trim() } : p,
        ),
      );
    }
    setEditingId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSave = () => {
    onSave(localParticipants);
    onClose();
  };

  const renderParticipant = ({ item }: { item: Participant }) => (
    <View style={styles.participantItem}>
      {editingId === item.id ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editingName}
            onChangeText={setEditingName}
            autoFocus
          />
          <TouchableOpacity onPress={saveEdit} style={styles.saveButton}>
            <Text style={styles.saveText}>✓</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={cancelEdit} style={styles.cancelButton}>
            <Text style={styles.cancelText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.participantContent}>
          <Text style={styles.participantName}>{item.name}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => startEdit(item)}
              style={styles.editButton}
            >
              <Text style={styles.editText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteParticipant(item.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Customize Participants</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addSection}>
            <TextInput
              style={styles.input}
              placeholder="Add participant name..."
              value={newName}
              onChangeText={setNewName}
              onSubmitEditing={addParticipant}
            />
            <Button
              title="Add"
              onPress={addParticipant}
              size="small"
              style={{ width: '18%' }}
            />
          </View>

          <FlatList
            data={localParticipants}
            renderItem={renderParticipant}
            keyExtractor={item => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.footerButton}
              size="medium"
            />
            <Button
              title="Save"
              onPress={handleSave}
              style={styles.footerButton}
              size="medium"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    width: '90%',
    maxHeight: '80%',
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  closeText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  addSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  input: {
    // flex: 1,
    width: '75%',
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body1,
  },
  list: {
    maxHeight: 300,
    marginBottom: Spacing.lg,
  },
  participantItem: {
    marginBottom: Spacing.sm,
  },
  participantContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
  },
  participantName: {
    ...Typography.body1,
    color: Colors.textPrimary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  editButton: {
    padding: Spacing.xs,
  },
  editText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  deleteText: {
    fontSize: 16,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    ...Typography.body1,
  },
  saveButton: {
    padding: Spacing.xs,
  },
  saveText: {
    fontSize: 16,
    color: Colors.success,
  },
  cancelButton: {
    padding: Spacing.xs,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.error,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
