-- Elimina los proyectos DEMO por su marcador en description (sin IDs quemados);
-- activities se elimina en cascada (ON DELETE CASCADE).
DELETE FROM projects WHERE description LIKE 'DEMO —%';
