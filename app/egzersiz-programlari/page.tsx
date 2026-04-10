'use client';

import { useState } from 'react';
import { Dumbbell, X, CheckCircle2, Plus, Trash2, Edit3, Save, MessageSquare, User, Search } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { exercises } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Exercise, ExerciseProgramItem } from '@/lib/types';

function ExerciseCard({
  exercise,
  language,
  assignedInfo,
  onAssign,
}: {
  exercise: Exercise;
  language: 'tr' | 'en';
  assignedInfo?: { sets: number; reps: number; notes: string } | null;
  onAssign?: () => void;
}) {
  const difficultyLabel = (d: string) => {
    if (d === 'Kolay') return t('difficulty.easy', language);
    if (d === 'Orta') return t('difficulty.medium', language);
    return t('difficulty.hard', language);
  };

  const difficultyVariant = exercise.difficulty === 'Kolay' ? 'success' : exercise.difficulty === 'Orta' ? 'warning' : 'danger';
  const tr = language === 'tr';

  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Dumbbell className="h-5 w-5 text-primary" />
        </div>
        <Badge variant={difficultyVariant}>{difficultyLabel(exercise.difficulty)}</Badge>
      </div>

      <h3 className="text-sm font-semibold text-text-main">{exercise.name}</h3>
      <p className="text-xs text-text-secondary mt-0.5 mb-3">{exercise.category}</p>

      <div className="flex items-center gap-2 mb-3">
        <Badge variant="info">{assignedInfo ? assignedInfo.sets : exercise.sets} set</Badge>
        <Badge variant="info">{assignedInfo ? assignedInfo.reps : exercise.reps} {t('patientDetail.rep', language)}</Badge>
      </div>

      {assignedInfo?.notes && (
        <p className="text-xs text-warning font-medium mb-3 bg-warning/10 rounded-lg px-3 py-2">
          <MessageSquare className="h-3 w-3 inline mr-1" />
          {assignedInfo.notes}
        </p>
      )}

      {onAssign && (
        <Button size="sm" icon={Plus} className="w-full" onClick={onAssign}>
          {tr ? 'Ata' : 'Assign'}
        </Button>
      )}
    </Card>
  );
}

// Doctor: Assign program modal
function AssignProgramModal({
  isOpen,
  onClose,
  language,
  preselectedExerciseId,
}: {
  isOpen: boolean;
  onClose: () => void;
  language: 'tr' | 'en';
  preselectedExerciseId?: string;
}) {
  const patients = useStore((s) => s.patients);
  const exercisePrograms = useStore((s) => s.exercisePrograms);
  const addExerciseProgram = useStore((s) => s.addExerciseProgram);
  const updateExerciseProgram = useStore((s) => s.updateExerciseProgram);
  const showToast = useStore((s) => s.showToast);
  const tr = language === 'tr';

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [frequency, setFrequency] = useState('Günde 1 kez');
  const [selectedExercises, setSelectedExercises] = useState<
    { exerciseId: string; sets: number; reps: number; notes: string }[]
  >(preselectedExerciseId ? [{
    exerciseId: preselectedExerciseId,
    sets: exercises.find(e => e.id === preselectedExerciseId)?.sets || 3,
    reps: exercises.find(e => e.id === preselectedExerciseId)?.reps || 10,
    notes: '',
  }] : []);

  const existingProgram = selectedPatientId
    ? exercisePrograms.find((ep) => ep.patientId === selectedPatientId)
    : null;

  const loadExisting = (patientId: string) => {
    setSelectedPatientId(patientId);
    const existing = exercisePrograms.find((ep) => ep.patientId === patientId);
    if (existing) {
      setSelectedExercises([...existing.exercises]);
      setFrequency(existing.frequency);
    } else {
      if (!preselectedExerciseId) setSelectedExercises([]);
    }
  };

  const addExercise = (exerciseId: string) => {
    if (selectedExercises.some((se) => se.exerciseId === exerciseId)) return;
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    setSelectedExercises([...selectedExercises, { exerciseId, sets: ex.sets, reps: ex.reps, notes: '' }]);
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter((se) => se.exerciseId !== exerciseId));
  };

  const updateExerciseItem = (exerciseId: string, field: keyof ExerciseProgramItem, value: string | number) => {
    setSelectedExercises(selectedExercises.map((se) =>
      se.exerciseId === exerciseId ? { ...se, [field]: value } : se
    ));
  };

  const handleSave = () => {
    if (!selectedPatientId) {
      showToast(tr ? 'Lütfen bir hasta seçin' : 'Please select a patient', 'error');
      return;
    }
    if (selectedExercises.length === 0) {
      showToast(tr ? 'En az bir egzersiz ekleyin' : 'Add at least one exercise', 'error');
      return;
    }

    const patient = patients.find((p) => p.id === selectedPatientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';

    if (existingProgram) {
      updateExerciseProgram(existingProgram.id, { exercises: selectedExercises, frequency });
      showToast(tr ? `${patientName} programı güncellendi` : `${patientName}'s program updated`);
    } else {
      addExerciseProgram({
        id: `ep-${Date.now()}`,
        patientId: selectedPatientId,
        patientName,
        treatmentPlanId: '',
        exercises: selectedExercises,
        startDate: new Date().toISOString().split('T')[0],
        frequency,
      });
      showToast(tr ? `${patientName} için program oluşturuldu` : `Program created for ${patientName}`);
    }

    onClose();
  };

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName}`,
  }));

  const frequencyOptions = [
    { value: 'Günde 1 kez', label: tr ? 'Günde 1 kez' : 'Once a day' },
    { value: 'Günde 2 kez', label: tr ? 'Günde 2 kez' : 'Twice a day' },
    { value: 'Günde 3 kez', label: tr ? 'Günde 3 kez' : '3 times a day' },
    { value: 'Haftada 3 kez', label: tr ? 'Haftada 3 kez' : '3 times a week' },
    { value: 'Haftada 5 kez', label: tr ? 'Haftada 5 kez' : '5 times a week' },
  ];

  const availableExercises = exercises.filter(
    (e) => !selectedExercises.some((se) => se.exerciseId === e.id)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tr ? 'Egzersiz Programı Ata' : 'Assign Exercise Program'}
      size="lg"
    >
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        <Select
          label={tr ? 'Hasta' : 'Patient'}
          value={selectedPatientId}
          onChange={(e) => loadExisting(e.target.value)}
          options={[{ value: '', label: tr ? 'Hasta seçin...' : 'Select patient...' }, ...patientOptions]}
        />

        {existingProgram && (
          <div className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/20 px-3 py-2">
            <Edit3 className="h-3.5 w-3.5 text-warning flex-shrink-0" />
            <p className="text-xs text-warning">
              {tr ? 'Bu hastanın mevcut programı düzenlenecek.' : "This patient's existing program will be updated."}
            </p>
          </div>
        )}

        <Select
          label={tr ? 'Sıklık' : 'Frequency'}
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          options={frequencyOptions}
        />

        <div>
          <label className="text-sm font-medium text-text-main block mb-1.5">
            {tr ? 'Egzersiz Ekle' : 'Add Exercise'}
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto rounded-lg border border-border p-2">
            {availableExercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => addExercise(ex.id)}
                className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2 text-left hover:bg-primary/5 hover:border-primary/30 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-main truncate">{ex.name}</p>
                  <p className="text-[10px] text-text-secondary">{ex.category}</p>
                </div>
              </button>
            ))}
            {availableExercises.length === 0 && (
              <p className="text-xs text-text-secondary col-span-2 text-center py-2">
                {tr ? 'Tüm egzersizler eklendi' : 'All exercises added'}
              </p>
            )}
          </div>
        </div>

        {selectedExercises.length > 0 && (
          <div>
            <label className="text-sm font-medium text-text-main block mb-1.5">
              {tr ? `Seçili Egzersizler (${selectedExercises.length})` : `Selected Exercises (${selectedExercises.length})`}
            </label>
            <div className="space-y-3">
              {selectedExercises.map((item) => {
                const ex = exercises.find((e) => e.id === item.exerciseId);
                if (!ex) return null;
                return (
                  <div key={item.exerciseId} className="rounded-xl border border-border p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Dumbbell className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-main">{ex.name}</p>
                          <p className="text-[10px] text-text-secondary">{ex.category}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeExercise(item.exerciseId)}
                        className="rounded-lg p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-text-secondary block mb-0.5">Set</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={item.sets}
                          onChange={(e) => updateExerciseItem(item.exerciseId, 'sets', parseInt(e.target.value) || 1)}
                          className="h-8 w-full rounded-lg border border-border bg-card px-2 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-secondary block mb-0.5">{tr ? 'Tekrar' : 'Reps'}</label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={item.reps}
                          onChange={(e) => updateExerciseItem(item.exerciseId, 'reps', parseInt(e.target.value) || 1)}
                          className="h-8 w-full rounded-lg border border-border bg-card px-2 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-secondary block mb-0.5">
                          <MessageSquare className="h-2.5 w-2.5 inline mr-0.5" />
                          {tr ? 'Not' : 'Note'}
                        </label>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateExerciseItem(item.exerciseId, 'notes', e.target.value)}
                          placeholder={tr ? 'Hastaya not...' : 'Note to patient...'}
                          className="h-8 w-full rounded-lg border border-border bg-card px-2 text-xs text-text-main placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {tr ? 'İptal' : 'Cancel'}
          </Button>
          <Button icon={Save} onClick={handleSave} className="flex-1">
            {existingProgram
              ? (tr ? 'Programı Güncelle' : 'Update Program')
              : (tr ? 'Program Ata' : 'Assign Program')
            }
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function EgzersizProgramlariPage() {
  const language = useStore((s) => s.language);
  const userRole = useStore((s) => s.userRole);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const patients = useStore((s) => s.patients);
  const exercisePrograms = useStore((s) => s.exercisePrograms);
  const removeExerciseProgram = useStore((s) => s.removeExerciseProgram);
  const showToast = useStore((s) => s.showToast);

  const [search, setSearch] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [preselectedExercise, setPreselectedExercise] = useState<string | undefined>();

  const isPatient = userRole === 'patient';
  const tr = language === 'tr';

  // Patient's assigned program
  const myProgram = isPatient
    ? exercisePrograms.find((ep) => ep.patientId === loggedInPatientId)
    : null;

  const myExerciseIds = myProgram ? myProgram.exercises.map((e) => e.exerciseId) : [];
  const myExercises = myProgram
    ? myProgram.exercises
        .map((item) => {
          const ex = exercises.find((e) => e.id === item.exerciseId);
          return ex ? { exercise: ex, assigned: item } : null;
        })
        .filter(Boolean) as { exercise: Exercise; assigned: ExerciseProgramItem }[]
    : [];

  const filterExercises = (list: Exercise[]) =>
    search.trim()
      ? list.filter((e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.category.toLowerCase().includes(search.toLowerCase())
        )
      : list;

  const otherExercises = isPatient
    ? filterExercises(exercises.filter((e) => !myExerciseIds.includes(e.id)))
    : filterExercises(exercises);

  const assignedPrograms = !isPatient ? exercisePrograms : [];

  const openAssignModal = (exerciseId?: string) => {
    setPreselectedExercise(exerciseId);
    setAssignModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-main">
            {isPatient ? (tr ? 'Egzersiz Programım' : 'My Exercise Program') : t('exercises.title', language)}
          </h2>
          <p className="text-sm text-text-secondary">
            {isPatient
              ? (tr ? 'Atanmış egzersizler ve egzersiz kütüphanesi' : 'Assigned exercises and exercise library')
              : `${exercises.length} ${t('exercises.count', language)}`
            }
          </p>
        </div>
        {!isPatient && (
          <Button icon={Plus} onClick={() => openAssignModal()}>
            {tr ? 'Program Ata' : 'Assign Program'}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tr ? 'Egzersiz veya kategori ara...' : 'Search exercise or category...'}
          className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-sm text-text-main placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-main transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Doctor: Assigned Programs Summary */}
      {!isPatient && assignedPrograms.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-text-main mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-health-green" />
            {tr ? 'Atanmış Programlar' : 'Assigned Programs'}
            <Badge variant="info">{assignedPrograms.length}</Badge>
          </h3>
          <div className="space-y-2.5">
            {assignedPrograms.map((prog) => {
              const patient = patients.find((p) => p.id === prog.patientId);
              const patientName = patient ? `${patient.firstName} ${patient.lastName}` : prog.patientName;
              return (
                <div key={prog.id} className="flex items-center gap-3 rounded-xl border border-border/50 p-3 hover:bg-background transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-main">{patientName}</p>
                    <p className="text-[11px] text-text-secondary">
                      {prog.exercises.length} {tr ? 'egzersiz' : 'exercises'} • {prog.frequency}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openAssignModal()}
                      className="rounded-lg p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                      title={tr ? 'Düzenle' : 'Edit'}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        removeExerciseProgram(prog.id);
                        showToast(tr ? 'Program kaldırıldı' : 'Program removed');
                      }}
                      className="rounded-lg p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                      title={tr ? 'Kaldır' : 'Remove'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Patient: My Assigned Exercises */}
      {isPatient && myProgram && myExercises.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-main mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-health-green" />
            {tr ? 'Atanmış Egzersizlerim' : 'My Assigned Exercises'}
            <Badge variant="info">{myProgram.frequency}</Badge>
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myExercises.map(({ exercise, assigned }) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                language={language}
                assignedInfo={assigned}
              />
            ))}
          </div>
        </div>
      )}

      {/* Divider for patient */}
      {isPatient && myExercises.length > 0 && otherExercises.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-secondary font-medium">
            {tr ? 'Diğer Egzersizler' : 'Other Exercises'}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      {/* All exercises (doctor) or other exercises (patient) */}
      {otherExercises.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              language={language}
              onAssign={!isPatient ? () => openAssignModal(exercise.id) : undefined}
            />
          ))}
        </div>
      ) : search ? (
        <div className="py-12 text-center text-sm text-text-secondary">
          {tr ? 'Arama sonucu bulunamadı.' : 'No results found.'}
        </div>
      ) : null}

      {/* Assign Program Modal (Doctor) */}
      {assignModalOpen && (
        <AssignProgramModal
          isOpen={assignModalOpen}
          onClose={() => { setAssignModalOpen(false); setPreselectedExercise(undefined); }}
          language={language}
          preselectedExerciseId={preselectedExercise}
        />
      )}
    </div>
  );
}
