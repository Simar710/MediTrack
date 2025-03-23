import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(MediTrackApp());
}

class MediTrackApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MediTrack',
      theme: ThemeData(primarySwatch: Colors.indigo),
      home: AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasData) {
          return Dashboard();
        }
        return LoginScreen();
      },
    );
  }
}

class LoginScreen extends StatelessWidget {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  Future<void> login(BuildContext context) async {
    try {
      await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: emailController.text.trim(),
        password: passwordController.text.trim(),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login failed: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: emailController,
              decoration: InputDecoration(labelText: 'Email'),
            ),
            TextField(
              controller: passwordController,
              decoration: InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => login(context),
              child: Text('Login'),
            ),
          ],
        ),
      ),
    );
  }
}

class Dashboard extends StatelessWidget {
  final FirebaseAuth auth = FirebaseAuth.instance;

  Future<void> logout(BuildContext context) async {
    await auth.signOut();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Dashboard'),
        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () => logout(context),
          ),
        ],
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance.collection('prescriptions').snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          }
          if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
            return Center(child: Text('No prescriptions found.'));
          }

          final prescriptions = snapshot.data!.docs;

          return ListView.builder(
            itemCount: prescriptions.length,
            itemBuilder: (context, index) {
              final prescription = prescriptions[index];
              final data = prescription.data() as Map<String, dynamic>;

              return Card(
                margin: EdgeInsets.all(8.0),
                child: ListTile(
                  title: Text(data['name']),
                  subtitle: Text('Dosage: ${data['dosage']}'),
                  trailing: Text(data['status']),
                  onTap: () {
                    if (data['status'] == 'pending' &&
                        auth.currentUser?.email == 'pharmacist@example.com') {
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: Text('Approve or Reject'),
                          actions: [
                            TextButton(
                              onPressed: () {
                                FirebaseFirestore.instance
                                    .collection('prescriptions')
                                    .doc(prescription.id)
                                    .update({'status': 'approved'});
                                Navigator.pop(context);
                              },
                              child: Text('Approve'),
                            ),
                            TextButton(
                              onPressed: () {
                                FirebaseFirestore.instance
                                    .collection('prescriptions')
                                    .doc(prescription.id)
                                    .update({'status': 'rejected'});
                                Navigator.pop(context);
                              },
                              child: Text('Reject'),
                            ),
                          ],
                        ),
                      );
                    }
                  },
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: auth.currentUser?.email != 'pharmacist@example.com'
          ? FloatingActionButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => AddPrescriptionScreen()),
                );
              },
              child: Icon(Icons.add),
            )
          : null,
    );
  }
}

class AddPrescriptionScreen extends StatelessWidget {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController dosageController = TextEditingController();

  Future<void> addPrescription(BuildContext context) async {
    try {
      await FirebaseFirestore.instance.collection('prescriptions').add({
        'name': nameController.text.trim(),
        'dosage': dosageController.text.trim(),
        'status': 'pending',
        'createdAt': Timestamp.now(),
      });
      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to add prescription: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Add Prescription')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: nameController,
              decoration: InputDecoration(labelText: 'Medicine Name'),
            ),
            TextField(
              controller: dosageController,
              decoration: InputDecoration(labelText: 'Dosage'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => addPrescription(context),
              child: Text('Add'),
            ),
          ],
        ),
      ),
    );
  }
}
