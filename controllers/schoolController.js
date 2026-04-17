import pool from '../config/db.js';
import { calculateDistance } from '../utils/distance.js';

/**
 * Add a new school
 */
export const addSchool = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Temporary debug

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const { name, address, latitude, longitude } = req.body;

    // Validate that all fields are present
    if (!name || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        error: 'All fields (name, address, latitude, longitude) are required' 
      });
    }

    // Validate that latitude and longitude are numeric
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ 
        error: 'Latitude and longitude must be valid numbers' 
      });
    }

    // Parameterized query using mysql2/promise
    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    const [result] = await pool.execute(query, [name, address, lat, lng]);

    // Send success response
    res.status(201).json({
      message: 'School added successfully',
      id: result.insertId
    });

  } catch (error) {
    console.error('Error adding school:', error.message);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

/**
 * List all schools sorted by proximity to user location
 */
export const listSchools = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    // Input Validation
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required parameters' 
      });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    if (isNaN(userLat) || isNaN(userLon)) {
      return res.status(400).json({ 
        error: 'Latitude and longitude must be valid numbers' 
      });
    }

    // Fetch all database records
    const [schools] = await pool.execute('SELECT * FROM schools');

    // Attach distance calculation safely without unnecessarily mutating raw db query array
    const schoolsWithDistance = schools.map(school => {
      const distance = calculateDistance(userLat, userLon, school.latitude, school.longitude);
      return {
        ...school,
        distance
      };
    });

    // Sort ascending by distance (nearest first)
    schoolsWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(200).json(schoolsWithDistance);

  } catch (error) {
    console.error('Error fetching schools:', error.message);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};
