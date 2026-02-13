import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface ModuleProgress {
  completed: boolean;
  score: number;
  maxScore: number;
  startedAt?: string;
  completedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
}

export interface CourseState {
  currentModule: number;
  modules: Record<number, ModuleProgress>;
  totalScore: number;
  badges: Badge[];
  vocabularyDismissed: string[];
  userName: string;
  startedAt: string;
}

const STORAGE_KEY = 'go-course-progress';
const TOTAL_MODULES = 12;

export const allBadges: Badge[] = [
  { id: 'primer-printf', name: 'Primer Printf', icon: '🖨️', description: 'Completaste tu primer programa en Go' },
  { id: 'tipado-fuerte', name: 'Tipado Fuerte', icon: '🔒', description: 'Dominaste el sistema de tipos de Go' },
  { id: 'flow-master', name: 'Flow Master', icon: '🔄', description: 'Controlas el flujo como un pro' },
  { id: 'func-wizard', name: 'Func Wizard', icon: '🧙', description: 'Las funciones en Go no tienen secretos para ti' },
  { id: 'slice-ninja', name: 'Slice Ninja', icon: '🥷', description: 'Slices, arrays y maps son tu dominio' },
  { id: 'struct-architect', name: 'Struct Architect', icon: '🏗️', description: 'Diseñas structs como un arquitecto' },
  { id: 'interface-guru', name: 'Interface Guru', icon: '🧘', description: 'Las interfaces implícitas son tu superpoder' },
  { id: 'error-handler', name: 'Error Handler', icon: '🛡️', description: 'Manejas errores como valores, no excepciones' },
  { id: 'gopher-concurrente', name: 'Gopher Concurrente', icon: '⚡', description: 'Goroutines y channels son tu playground' },
  { id: 'go-master', name: 'Go Master', icon: '🏆', description: 'Completaste todos los módulos. Eres un Go Master!' },
];

function getInitialState(): CourseState {
  if (browser) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // corrupted data, start fresh
      }
    }
  }
  return {
    currentModule: 1,
    modules: {},
    totalScore: 0,
    badges: [],
    vocabularyDismissed: [],
    userName: '',
    startedAt: new Date().toISOString(),
  };
}

function createCourseStore() {
  const { subscribe, set, update } = writable<CourseState>(getInitialState());

  function persist(state: CourseState) {
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }

  return {
    subscribe,
    setUserName: (name: string) => {
      update(s => {
        const next = { ...s, userName: name };
        persist(next);
        return next;
      });
    },
    startModule: (moduleId: number) => {
      update(s => {
        if (s.modules[moduleId]?.startedAt) return s;
        const next = {
          ...s,
          modules: {
            ...s.modules,
            [moduleId]: {
              completed: false,
              score: 0,
              maxScore: 0,
              startedAt: new Date().toISOString(),
            },
          },
        };
        persist(next);
        return next;
      });
    },
    completeModule: (moduleId: number, score: number, maxScore: number) => {
      update(s => {
        const newModules = {
          ...s.modules,
          [moduleId]: {
            completed: true,
            score,
            maxScore,
            startedAt: s.modules[moduleId]?.startedAt ?? new Date().toISOString(),
            completedAt: new Date().toISOString(),
          },
        };
        const newTotalScore = Object.values(newModules).reduce((acc, m) => acc + m.score, 0);
        const newCurrentModule = Math.max(s.currentModule, moduleId + 1);
        const next = {
          ...s,
          modules: newModules,
          totalScore: newTotalScore,
          currentModule: Math.min(newCurrentModule, TOTAL_MODULES + 1),
        };
        persist(next);
        return next;
      });
    },
    unlockBadge: (badgeId: string) => {
      update(s => {
        if (s.badges.find(b => b.id === badgeId)) return s;
        const badge = allBadges.find(b => b.id === badgeId);
        if (!badge) return s;
        const next = {
          ...s,
          badges: [...s.badges, { ...badge, unlockedAt: new Date().toISOString() }],
        };
        persist(next);
        return next;
      });
    },
    dismissVocabulary: (termId: string) => {
      update(s => {
        if (s.vocabularyDismissed.includes(termId)) return s;
        const next = { ...s, vocabularyDismissed: [...s.vocabularyDismissed, termId] };
        persist(next);
        return next;
      });
    },
    reset: () => {
      const fresh: CourseState = {
        currentModule: 1,
        modules: {},
        totalScore: 0,
        badges: [],
        vocabularyDismissed: [],
        userName: '',
        startedAt: new Date().toISOString(),
      };
      if (browser) localStorage.removeItem(STORAGE_KEY);
      set(fresh);
    },
  };
}

export const courseStore = createCourseStore();

export const progressPercent = derived(courseStore, ($store) => {
  const completed = Object.values($store.modules).filter(m => m.completed).length;
  return Math.round((completed / TOTAL_MODULES) * 100);
});

export const totalModules = TOTAL_MODULES;
