import express from 'express';
import { addSchool, listSchools } from '../controllers/schoolController.js';

const router = express.Router();

// Route for adding a new school
router.post('/addSchool', addSchool);

// Route for listing schools sorted by proximity
router.get('/listSchools', listSchools);

export default router;
