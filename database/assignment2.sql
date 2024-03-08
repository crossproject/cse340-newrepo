-- Insert data into account table
INSERT INTO public.account (
	account_firstname,
	account_lastname,
	account_email,
	account_password
)
VALUES (
	'Tony',
	'Stark',
	'tony@starkent.com',
	'Iam1ronM@n'
);

-- Modify Tony Stark record
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;

-- Delete Tony Stark record
DELETE FROM public.account
WHERE account_id = 1;

-- Replace a substring from GM Hummer
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'the small interior', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Return make, model and classification from "Sport" category
SELECT inventory.inv_make, inventory.inv_model, classification.classification_name
FROM public.inventory
	INNER JOIN public.classification
	ON inventory.classification_id = classification.classification_id
WHERE classification.classification_name = 'Sport';

-- Update image source for inventory table
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images', '/images/vehicles'),
	inv_thumbnail = REPLACE(inv_thumbnail, '/images', '/images/vehicles');