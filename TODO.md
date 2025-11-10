# TODO: Fix Blank Page Issue in Frontend

## Steps to Complete:
- [x] Edit src/AdminApp.jsx to add default export (`export default AdminApp;`) to resolve module loading error.
- [x] Restart Vite dev server if necessary (`npm run dev`).
- [x] Test app by launching browser at http://localhost:5173 and verify HomePage renders without errors in console.
- [ ] Start backend server (`cd backend && npm run dev`) to fix API 404s.
- [ ] Fix video loading error in HomePage.jsx (move Video.mp4 to public/videos/ and update src).
- [ ] Re-test full app (API data loads, video plays).
- [ ] Mark complete and close TODO.

## Background:
- Issue: Blank page due to SyntaxError in AdminApp.jsx missing default export, preventing app rendering.
- Impacted Files: src/AdminApp.jsx (primary), src/App.jsx (import reference).
- Expected Outcome: Full app loads with HomePage hero section, video, components, etc.

## Progress Notes:
- Primary rendering fixed: HomePage now visible with modals, hero, etc.
- Secondary: API 404s (start backend), video load error (adjust asset path).

## Implement Programs > Modules > Courses Hierarchy with Horarios Links

### Steps:
- [ ] Create migration `backend/database/migrations/add_curso_id_to_horarios.sql` (add curso_id FK to horarios table).
- [ ] Run the migration using MySQL client or pool.execute.
- [ ] Create `backend/modulos.js` (full CRUD API for modules, linked to programs).
- [ ] Update `backend/index.js` to mount the modulos router (`app.use('/api/modulos', modulosRouter);`).
- [ ] Update `backend/cursos.js` (expand to full CRUD, add filters by modulo_id/programa_id, JOINs for hierarchy).
- [ ] Update `backend/routes/horarios.js` (integrate curso_id: update CRUD to use FK, replace nombre_curso with JOIN to cursos).
- [ ] Update `backend/programas.js` (enhance GET endpoints to include nested modules and courses via JOINs).
- [ ] Create `backend/populate_data.js` (script to insert brochure data: programs, modules, courses).
- [ ] Execute `node backend/populate_data.js` to populate DB.
- [ ] Update `src/pages/admin/Modulos.jsx` (add Select for programs, display program name in table).
- [ ] Update `src/pages/admin/Cursos.jsx` (add Select for modules, auto-set programa_id, display hierarchy).
- [ ] Update `src/pages/admin/Horarios.jsx` (add Select for courses, display full path: program/module/course).
- [ ] Update `src/pages/admin/ProgramasAdmin.jsx` (show module/course counts via API).
- [ ] Update `src/components/ProgramCatalog.jsx` (render nested structure: programs > modules > courses).
- [ ] Update `src/config/api.js` (add modulos endpoints, enhanced params for others).
- [ ] Test backend: Use Postman or curl to create/test hierarchy (program > module > course > horario).
- [ ] Test frontend: npm run dev, navigate admin, create items in order, verify links.
- [ ] Verify DB: Run queries to check JOINs, relations, populated data.
- [ ] Handle any errors (e.g., update test_modulos.js if needed).
- [ ] Mark this section complete once all tested.

### Background:
- Based on approved plan for relational hierarchy, independent admin, horarios linking.
- Data from user brochure/images to be populated.
- Ensures creation order: programs first, then modules, then courses, then horarios.
- Impacted: Backend APIs, DB schema, admin UIs, public catalog.

### Progress Notes:
