ALTER TABLE admission_process
    ADD COLUMN emergency_contacts JSONB NOT NULL DEFAULT '[]';

UPDATE admission_process
SET emergency_contacts = jsonb_build_array(
        jsonb_build_object(
                'name', emergency_contact_name,
                'phone', emergency_contact_phone,
                'relationship', COALESCE(emergency_contact_relationship, '')
        )
                          )
WHERE emergency_contact_name IS NOT NULL
   OR emergency_contact_phone IS NOT NULL
   OR emergency_contact_relationship IS NOT NULL;

ALTER TABLE admission_process
    DROP COLUMN emergency_contact_name,
    DROP COLUMN emergency_contact_phone,
    DROP COLUMN emergency_contact_relationship;
