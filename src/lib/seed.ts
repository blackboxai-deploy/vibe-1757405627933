// Demo data seeder for testing the e-learning platform
import connectDB from './mongodb';
import User from './models/User';
import Course from './models/Course';
import Announcement from './models/Announcement';

export async function seedDatabase() {
  await connectDB();
  
  // Clear existing data
  await User.deleteMany({});
  await Course.deleteMany({});
  await Announcement.deleteMany({});
  
  // Create demo users
  const adminUser = new User({
    name: 'BWC Admin',
    email: 'admin@bwc.com',
    password: 'password123',
    role: 'admin',
  });
  await adminUser.save();
  
  const teacherUser = new User({
    name: 'Instruktur Roblox',
    email: 'teacher@bwc.com',
    password: 'password123',
    role: 'teacher',
  });
  await teacherUser.save();
  
  const studentUser = new User({
    name: 'Siswa BWC',
    email: 'student@bwc.com',
    password: 'password123',
    role: 'student',
    grade: 'Grade 8',
  });
  await studentUser.save();
  
  // Create demo courses - Roblox Studio Curriculum
  const modul1 = new Course({
    title: 'Modul 1: Pengenalan Roblox Studio',
    description: 'Mengenal antarmuka Roblox Studio, membuat objek dasar, dan proyek miniatur rumah. Cocok untuk pemula yang baru memulai journey di Roblox.',
    targetGrades: ['Pemula (7-9 tahun)', 'Grade 7', 'Grade 8', 'Grade 9'],
    createdBy: teacherUser._id,
    lessons: [
      {
        title: 'Sesi 1: Mengenal Roblox Studio',
        videoUrl: 'https://placehold.co/1920x1080?text=Modul+1+Sesi+1+Instalasi+dan+navigasi+antarmuka+Roblox+Studio',
        transcription: 'Selamat datang di BWC Academy! Hari ini kita akan belajar mengenal Roblox Studio. Pertama-tama, kita akan menginstall Roblox Studio di komputer kalian. Setelah itu, kita akan menjelajahi antarmuka utama termasuk Explorer untuk melihat semua objek, Properties untuk mengatur setting objek, dan Toolbox untuk mengambil model gratis...',
        summary: '• Instalasi Roblox Studio di PC/Mac\n• Navigasi antarmuka: Explorer, Properties, Toolbox\n• Memahami Workspace, Lighting, dan Terrain\n• Pengaturan Camera dan view\n• Tips untuk pemula',
        resources: ['https://bwc.academy/roblox-studio-installer', 'https://bwc.academy/ui-cheatsheet.pdf'],
        order: 1,
        duration: 2700, // 45 minutes
      },
      {
        title: 'Sesi 2: Membuat Objek Dasar & Proyek Rumah',
        videoUrl: 'https://placehold.co/1920x1080?text=Modul+1+Sesi+2+Insert+Part+manipulasi+objek+dan+proyek+miniatur+rumah',
        transcription: 'Di sesi kedua ini, kita akan belajar cara membuat objek dasar di Roblox Studio. Kalian akan belajar insert Part seperti blok, sphere, wedge, dan cylinder. Kita juga akan belajar cara memindahkan, mengubah ukuran, dan memutar objek. Setelah itu, kita akan membuat proyek kecil berupa miniatur rumah menggunakan part-part dasar...',
        summary: '• Insert Part: Block, Sphere, Wedge, Cylinder\n• Manipulasi objek: Move, Scale, Rotate\n• Grouping dan Anchoring objek\n• Setting Material dan Color\n• Proyek: Miniatur rumah sederhana',
        resources: ['https://bwc.academy/basic-parts-guide', 'https://bwc.academy/house-project-template'],
        order: 2,
        duration: 3000, // 50 minutes
      },
    ],
  });
  await modul1.save();

  const modul2 = new Course({
    title: 'Modul 2: Dasar-Dasar Scripting',
    description: 'Belajar programming Lua untuk mengontrol objek dan gameplay. Termasuk proyek pintu otomatis dengan sensor gerak.',
    targetGrades: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
    createdBy: teacherUser._id,
    lessons: [
      {
        title: 'Sesi 1: Pengenalan Lua di Roblox',
        videoUrl: 'https://placehold.co/1920x1080?text=Modul+2+Sesi+1+Script+LocalScript+Print+dan+debugging+dasar',
        transcription: 'Sekarang kita masuk ke dunia programming! Lua adalah bahasa pemrograman yang digunakan di Roblox Studio. Kita akan belajar perbedaan Script dan LocalScript, cara menggunakan print() untuk debugging, dan konsep dasar variabel serta tipe data...',
        summary: '• Perbedaan Script vs LocalScript\n• Print() dan Output window\n• Variabel, operator, dan tipe data\n• Debugging tips untuk pemula\n• Praktik coding pertama',
        resources: ['https://bwc.academy/lua-basics-cheatsheet', 'https://bwc.academy/debugging-guide'],
        order: 1,
        duration: 2700, // 45 minutes
      },
      {
        title: 'Sesi 2: Kontrol Program',
        videoUrl: 'https://placehold.co/1920x1080?text=Modul+2+Sesi+2+If+else+loops+dan+event+programming',
        transcription: 'Di sesi ini kita akan belajar cara mengontrol alur program. If-else untuk membuat keputusan, loops untuk mengulang aksi, dan event untuk merespons interaksi player...',
        summary: '• If-else statements dan kondisi\n• For, while, dan repeat loops\n• Fungsi dasar dan parameter\n• Event: Connect, Touched, ClickDetector\n• Praktik dengan berbagai event',
        resources: ['https://bwc.academy/control-structures', 'https://bwc.academy/event-examples'],
        order: 2,
        duration: 3000, // 50 minutes
      },
      {
        title: 'Sesi 3: Mengendalikan Objek & Proyek Pintu',
        videoUrl: 'https://placehold.co/1920x1080?text=Modul+2+Sesi+3+Mengubah+properti+objek+dan+membuat+pintu+otomatis',
        transcription: 'Saatnya membuat sesuatu yang keren! Kita akan belajar cara mengubah properti objek melalui script, membuat pintu otomatis yang terbuka saat player mendekat, dan menambahkan efek suara...',
        summary: '• Mengubah properti: Transparency, Color, Position\n• Pintu otomatis dengan Touched event\n• Menambahkan suara dan efek visual\n• Proyek: Pintu otomatis + lampu sensor\n• Testing dan troubleshooting',
        resources: ['https://bwc.academy/object-properties', 'https://bwc.academy/door-project-code'],
        order: 3,
        duration: 3300, // 55 minutes
      },
    ],
  });
  await modul2.save();

  // Enroll student in first module
  studentUser.enrolledCourses.push(modul1._id);
  modul1.enrolledStudents.push(studentUser._id);
  await studentUser.save();
  await modul1.save();
  
  // Create demo announcements
  const announcement1 = new Announcement({
    title: 'Selamat Datang di BWC Academy!',
    content: 'Halo future game developers! 🎮\n\nSelamat datang di BWC Academy - tempat dimana kalian akan belajar membuat game amazing di Roblox Studio! \n\nYang perlu kalian siapkan:\n- Install Roblox Studio di komputer\n- Siapkan akun Roblox untuk testing\n- Join Discord server kita untuk tanya-jawab\n- Download starter assets dari resources\n\nKalau ada pertanyaan, jangan ragu chat instruktur ya! Let\'s create something awesome! 🚀',
    link: 'https://discord.gg/bwcacademy',
    targetGrades: ['Pemula (7-9 tahun)', 'Grade 7', 'Grade 8', 'Grade 9'],
    author: teacherUser._id,
  });
  await announcement1.save();
  
  const announcement2 = new Announcement({
    title: 'Workshop Live: Membuat Game Obby',
    content: 'Jangan sampai ketinggalan workshop live kita hari Sabtu jam 14:00! 🔥\n\nDi workshop ini kita akan:\n- Review semua modul yang sudah dipelajari\n- Live coding: Membuat game Obby dari awal\n- Q&A session dengan instruktur\n- Tips & tricks untuk publish game\n- Challenge mini untuk hadiah merchandise BWC!\n\nDaftar sekarang, slot terbatas untuk 30 siswa pertama!',
    link: 'https://zoom.us/j/bwcacademy-obby-workshop',
    targetGrades: ['Grade 8', 'Grade 9', 'Grade 10'],
    author: teacherUser._id,
  });
  await announcement2.save();
  
  console.log('✅ BWC Academy database seeded successfully!');
  console.log('Demo accounts created:');
  console.log('- Admin: admin@bwc.com / password123');
  console.log('- Teacher: teacher@bwc.com / password123');  
  console.log('- Student: student@bwc.com / password123');
}