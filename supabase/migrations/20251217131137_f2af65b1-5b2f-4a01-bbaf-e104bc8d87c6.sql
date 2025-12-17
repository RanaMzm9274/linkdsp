-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Insert sample universities
INSERT INTO public.universities (name, country, city, logo_url, description, requirements, deadlines, status) VALUES
('Harvard University', 'United States', 'Cambridge', 'https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop', 'One of the world''s most prestigious universities, Harvard offers exceptional programs across all disciplines with a focus on research and innovation.', 'Strong academic record, SAT/ACT scores, Essays, Letters of recommendation', 'January 1, 2025', 'active'),
('University of Oxford', 'United Kingdom', 'Oxford', 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=200&h=200&fit=crop', 'A world-renowned research university with a rich history spanning over 900 years, offering rigorous academic programs.', 'A-levels or equivalent, Personal statement, Interview', 'October 15, 2024', 'active'),
('ETH Zurich', 'Switzerland', 'Zurich', 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=200&h=200&fit=crop', 'A leading science and technology university known for excellence in engineering, natural sciences, and mathematics.', 'High school diploma, Language proficiency, Entrance exam', 'December 15, 2024', 'active'),
('University of Toronto', 'Canada', 'Toronto', 'https://images.unsplash.com/photo-1569098644584-210bcd375b59?w=200&h=200&fit=crop', 'Canada''s top university offering diverse programs and world-class research opportunities in a multicultural environment.', 'High school transcript, English proficiency, Supplementary application', 'January 15, 2025', 'active'),
('National University of Singapore', 'Singapore', 'Singapore', 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=200&h=200&fit=crop', 'Asia''s leading global university with strong programs in business, computing, and engineering.', 'A-levels or equivalent, SAT scores, Portfolio for some programs', 'February 28, 2025', 'active'),
('University of Melbourne', 'Australia', 'Melbourne', 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=200&h=200&fit=crop', 'Australia''s premier university known for innovative teaching and groundbreaking research across multiple disciplines.', 'High school completion, IELTS/TOEFL, Personal statement', 'November 30, 2024', 'active');

-- Get university IDs for programs
DO $$
DECLARE
  harvard_id UUID;
  oxford_id UUID;
  eth_id UUID;
  toronto_id UUID;
  nus_id UUID;
  melbourne_id UUID;
BEGIN
  SELECT id INTO harvard_id FROM public.universities WHERE name = 'Harvard University';
  SELECT id INTO oxford_id FROM public.universities WHERE name = 'University of Oxford';
  SELECT id INTO eth_id FROM public.universities WHERE name = 'ETH Zurich';
  SELECT id INTO toronto_id FROM public.universities WHERE name = 'University of Toronto';
  SELECT id INTO nus_id FROM public.universities WHERE name = 'National University of Singapore';
  SELECT id INTO melbourne_id FROM public.universities WHERE name = 'University of Melbourne';

  -- Harvard programs
  INSERT INTO public.programs (university_id, name, department, degree_type, duration, tuition_fee, requirements, description) VALUES
  (harvard_id, 'Computer Science', 'School of Engineering', 'Bachelor''s', '4 years', '$54,000/year', 'Math proficiency, Programming background recommended', 'Comprehensive CS program covering AI, systems, and theory.'),
  (harvard_id, 'Business Administration', 'Business School', 'MBA', '2 years', '$73,000/year', 'Work experience, GMAT/GRE', 'World-renowned MBA program with extensive networking opportunities.'),
  (harvard_id, 'Law', 'Law School', 'JD', '3 years', '$67,000/year', 'Bachelor''s degree, LSAT', 'Top-ranked law program with diverse specializations.');

  -- Oxford programs
  INSERT INTO public.programs (university_id, name, department, degree_type, duration, tuition_fee, requirements, description) VALUES
  (oxford_id, 'Philosophy, Politics and Economics', 'Social Sciences', 'Bachelor''s', '3 years', '£28,000/year', 'A-levels: AAA, Admissions test', 'Prestigious interdisciplinary program for future leaders.'),
  (oxford_id, 'Medicine', 'Medical Sciences', 'MBBS', '6 years', '£37,000/year', 'A-levels in sciences, BMAT', 'World-class medical training with clinical experience.');

  -- ETH programs
  INSERT INTO public.programs (university_id, name, department, degree_type, duration, tuition_fee, requirements, description) VALUES
  (eth_id, 'Mechanical Engineering', 'Engineering', 'Master''s', '2 years', 'CHF 1,300/year', 'Bachelor''s in engineering, German/English', 'Cutting-edge engineering with industry partnerships.'),
  (eth_id, 'Data Science', 'Computer Science', 'Master''s', '2 years', 'CHF 1,300/year', 'Bachelor''s in CS/Math, Programming skills', 'Advanced data science and machine learning program.');

  -- Toronto programs
  INSERT INTO public.programs (university_id, name, department, degree_type, duration, tuition_fee, requirements, description) VALUES
  (toronto_id, 'Artificial Intelligence', 'Computer Science', 'Master''s', '2 years', 'CAD 52,000/year', 'CS background, Research experience', 'Leading AI research program with Vector Institute collaboration.'),
  (toronto_id, 'Finance', 'Rotman School', 'MBA', '2 years', 'CAD 95,000/year', 'Work experience, GMAT', 'Top Canadian MBA with finance specialization.');

  -- NUS programs
  INSERT INTO public.programs (university_id, name, department, degree_type, duration, tuition_fee, requirements, description) VALUES
  (nus_id, 'Business Analytics', 'Business School', 'Bachelor''s', '4 years', 'SGD 42,000/year', 'Math proficiency, English language', 'Data-driven business program in Asia''s business hub.'),
  (nus_id, 'Computing', 'School of Computing', 'Bachelor''s', '4 years', 'SGD 38,000/year', 'Math and science background', 'Comprehensive computing education with industry exposure.');

  -- Melbourne programs
  INSERT INTO public.programs (university_id, name, department, degree_type, duration, tuition_fee, requirements, description) VALUES
  (melbourne_id, 'Architecture', 'Design School', 'Master''s', '3 years', 'AUD 45,000/year', 'Portfolio, Bachelor''s degree', 'Award-winning architecture program with sustainable focus.'),
  (melbourne_id, 'Biomedicine', 'Science', 'Bachelor''s', '3 years', 'AUD 46,000/year', 'High school sciences, IELTS', 'Pathway to medicine and health careers.');
END $$;