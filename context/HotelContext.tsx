
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, Booking, BookingStatus, RoomType } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  writeBatch,
  query,
  getDocs 
} from 'firebase/firestore';

// --- INITIAL SEED DATA ---
// This data is used ONLY if the database is empty to initialize the rooms.
const SEED_ROOMS: Room[] = [
  // 1st Floor
  { id: '101', number: '101', type: RoomType.KING, pricePerNight: 5000, status: 'CLEAN', amenities: ['Wifi', 'TV', 'AC'], capacity: 3 },
  { id: '102', number: '102', type: RoomType.KING, pricePerNight: 5000, status: 'DIRTY', amenities: ['Wifi', 'TV', 'AC'], capacity: 3 },
  { id: '103', number: '103', type: RoomType.DELUXE_QUEEN, pricePerNight: 3500, status: 'CLEAN', amenities: ['Wifi', 'TV'], capacity: 2 },
  { id: '104', number: '104', type: RoomType.DELUXE_KING, pricePerNight: 4500, status: 'CLEAN', amenities: ['Wifi', 'TV', 'AC', 'Balcony'], capacity: 2 },
  { id: '105', number: '105', type: RoomType.DELUXE_KING, pricePerNight: 4500, status: 'MAINTENANCE', amenities: ['Wifi', 'TV', 'AC', 'Balcony'], capacity: 2 },
  
  // 2nd Floor
  { id: '201', number: '201', type: RoomType.KING, pricePerNight: 5000, status: 'CLEAN', amenities: ['Wifi', 'TV', 'AC'], capacity: 3 },
  { id: '202', number: '202', type: RoomType.KING, pricePerNight: 5000, status: 'CLEAN', amenities: ['Wifi', 'TV', 'AC'], capacity: 3 },
  { id: '203', number: '203', type: RoomType.DELUXE_QUEEN, pricePerNight: 3500, status: 'DIRTY', amenities: ['Wifi', 'TV'], capacity: 2 },
  { id: '204', number: '204', type: RoomType.DELUXE_KING, pricePerNight: 4500, status: 'CLEAN', amenities: ['Wifi', 'TV', 'AC', 'Balcony'], capacity: 2 },
  { id: '205', number: '205', type: RoomType.DELUXE_KING, pricePerNight: 4500, status: 'CLEAN', amenities: ['Wifi', 'TV', 'AC', 'Balcony'], capacity: 2 },

  // 3rd Floor
  { id: '301', number: '301', type: RoomType.KING, pricePerNight: 5000, status: 'CLEAN', amenities: ['Wifi', 'TV', 'AC'], capacity: 3 },
  { id: '302', number: '302', type: RoomType.KING, pricePerNight: 5000, status: 'CLEAN', amenities: ['Wifi', 'TV', 'AC'], capacity: 3 },
  { id: '303', number: '303', type: RoomType.DELUXE_QUEEN, pricePerNight: 3500, status: 'CLEAN', amenities: ['Wifi', 'TV'], capacity: 2 },
  { id: '304', number: '304', type: RoomType.DELUXE_KING, pricePerNight: 4500, status: 'DIRTY', amenities: ['Wifi', 'TV', 'AC', 'Balcony'], capacity: 2 },
  { id: '305', number: '305', type: RoomType.DELUXE_KING, pricePerNight: 4500, status: 'CLEAN', amenities: ['Wifi', 'TV', 'AC', 'Balcony'], capacity: 2 },

  // 4th Floor
  { id: '401', number: '401', type: RoomType.QUEEN, pricePerNight: 3000, status: 'CLEAN', amenities: ['Wifi', 'TV'], capacity: 2 },
  { id: '402', number: '402', type: RoomType.QUEEN, pricePerNight: 3200, status: 'CLEAN', amenities: ['Wifi', 'TV'], capacity: 3 },
  { id: '403', number: '403', type: RoomType.DELUXE_QUEEN, pricePerNight: 3500, status: 'CLEAN', amenities: ['Wifi', 'TV'], capacity: 2 },
  { id: '404', number: '404', type: RoomType.DELUXE_KING, pricePerNight: 4500, status: 'CLEAN', amenities: ['Wifi', 'TV', 'AC', 'Balcony'], capacity: 2 },
  { id: '405', number: '405', type: RoomType.DELUXE_KING, pricePerNight: 4500, status: 'MAINTENANCE', amenities: ['Wifi', 'TV', 'AC', 'Balcony'], capacity: 2 },
];

interface HotelContextType {
  rooms: Room[];
  bookings: Booking[];
  addBooking: (booking: Booking) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  toggleRoomStatus: (id: string) => Promise<void>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>;
  isLoading: boolean;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Real-time Listeners ---

  useEffect(() => {
    // 1. Listen for Room Changes
    const roomsCollection = collection(db, 'rooms');
    const unsubscribeRooms = onSnapshot(roomsCollection, async (snapshot) => {
      if (snapshot.empty) {
        // If DB is empty, seed it with MOCK data
        console.log("Seeding Rooms Database...");
        const batch = writeBatch(db);
        SEED_ROOMS.forEach(room => {
            const ref = doc(db, 'rooms', room.id);
            batch.set(ref, room);
        });
        await batch.commit();
        return; // Snapshot will fire again after write
      }

      const roomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
      // Sort rooms by number
      roomsData.sort((a, b) => parseInt(a.number) - parseInt(b.number));
      setRooms(roomsData);
      setIsLoading(false);
    });

    // 2. Listen for Booking Changes
    const bookingsCollection = collection(db, 'bookings');
    const unsubscribeBookings = onSnapshot(bookingsCollection, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(bookingsData);
    });

    return () => {
      unsubscribeRooms();
      unsubscribeBookings();
    };
  }, []);

  // --- Actions ---

  const addBooking = async (booking: Booking) => {
    // Use the booking ID as the document ID for easier reference
    await setDoc(doc(db, 'bookings', booking.id), booking);
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    const bookingRef = doc(db, 'bookings', id);
    // Add updated metadata
    const updatesWithMeta = {
        ...updates,
        updatedAt: new Date().toISOString()
    };
    await updateDoc(bookingRef, updatesWithMeta);
  };

  const deleteBooking = async (id: string) => {
    await deleteDoc(doc(db, 'bookings', id));
  };
  
  const cancelBooking = async (id: string) => {
    await updateBooking(id, { 
        status: BookingStatus.CANCELLED,
        updatedAt: new Date().toISOString()
    });
  };

  const toggleRoomStatus = async (id: string) => {
    const room = rooms.find(r => r.id === id);
    if (!room) return;
    
    const nextStatus = room.status === 'CLEAN' ? 'DIRTY' : room.status === 'DIRTY' ? 'MAINTENANCE' : 'CLEAN';
    await updateDoc(doc(db, 'rooms', id), { status: nextStatus });
  };

  const updateRoom = async (id: string, updates: Partial<Room>) => {
    await updateDoc(doc(db, 'rooms', id), updates);
  };

  return (
    <HotelContext.Provider value={{ rooms, bookings, addBooking, updateBooking, deleteBooking, cancelBooking, toggleRoomStatus, updateRoom, isLoading }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) throw new Error('useHotel must be used within HotelProvider');
  return context;
};
