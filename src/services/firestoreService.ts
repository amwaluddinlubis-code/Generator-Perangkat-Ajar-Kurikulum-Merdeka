import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { TeacherUser, EducationalDocument } from '../types';

const TEACHERS_COLLECTION = 'teachers';
const DOCUMENTS_COLLECTION = 'documents';

// -------------------------------------------------------------
// TEACHERS / USERS FIRESTORE OPERATIONS
// -------------------------------------------------------------

export async function saveTeacherToFirestore(teacher: TeacherUser): Promise<void> {
  try {
    const teacherRef = doc(db, TEACHERS_COLLECTION, teacher.id);
    await setDoc(teacherRef, {
      ...teacher,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore saveTeacher warning (fallback to server in memory):', error);
  }
}

export async function getTeachersFromFirestore(): Promise<TeacherUser[]> {
  try {
    const teachersCol = collection(db, TEACHERS_COLLECTION);
    const snapshot = await getDocs(teachersCol);
    if (snapshot.empty) return [];
    return snapshot.docs.map((docSnap: { data: () => unknown }) => docSnap.data() as TeacherUser);
  } catch (error) {
    console.warn('Firestore getTeachers warning:', error);
    return [];
  }
}

export async function updateTeacherStatusInFirestore(
  teacherId: string, 
  status: 'VERIFIED' | 'PENDING' | 'REJECTED',
  verifiedBy?: string
): Promise<void> {
  try {
    const teacherRef = doc(db, TEACHERS_COLLECTION, teacherId);
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (status === 'VERIFIED') {
      updateData.verifiedAt = new Date().toISOString();
      updateData.verifiedBy = verifiedBy || 'Admin Kurikulum';
    } else {
      updateData.verifiedAt = null;
      updateData.verifiedBy = null;
    }
    await setDoc(teacherRef, updateData, { merge: true });
  } catch (error) {
    console.warn('Firestore updateTeacherStatus warning:', error);
  }
}

export async function deleteTeacherFromFirestore(teacherId: string): Promise<void> {
  try {
    const teacherRef = doc(db, TEACHERS_COLLECTION, teacherId);
    await deleteDoc(teacherRef);
  } catch (error) {
    console.warn('Firestore deleteTeacher warning:', error);
  }
}

// -------------------------------------------------------------
// EDUCATIONAL DOCUMENTS FIRESTORE OPERATIONS
// -------------------------------------------------------------

export async function saveDocumentToFirestore(document: EducationalDocument): Promise<void> {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, document.id);
    await setDoc(docRef, {
      ...document,
      firestoreSavedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore saveDocument warning:', error);
  }
}

export async function getDocumentsFromFirestore(): Promise<EducationalDocument[]> {
  try {
    const docsCol = collection(db, DOCUMENTS_COLLECTION);
    const snapshot = await getDocs(docsCol);
    if (snapshot.empty) return [];
    const list = snapshot.docs.map((docSnap: { data: () => unknown }) => docSnap.data() as EducationalDocument);
    // Sort descending by createdAt
    return list.sort((a: EducationalDocument, b: EducationalDocument) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Firestore getDocuments warning:', error);
    return [];
  }
}

export async function deleteDocumentFromFirestore(documentId: string): Promise<void> {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore deleteDocument warning:', error);
  }
}
