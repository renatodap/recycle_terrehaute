# Terre Haute Recycling Data Documentation

## Overview
This directory contains comprehensive data files for the Terre Haute Recycling mobile application. All data is based on local recycling rules and regulations as of September 2025.

## Data Sources
- City of Terre Haute official website
- Vigo County Solid Waste Management District
- Republic Services (local waste hauler)
- ISU Recycling Center
- Local business directories
- Field verification of drop-off locations

## Last Update
**September 2025** - Major update following February 2024 changes to glass recycling

## CSV File Structures

### recyclable-items.csv
Contains comprehensive list of items and their recyclability status in Terre Haute.

**Fields:**
- `item_name`: Common name of the item
- `category`: Material category (paper, plastic, metal, glass, etc.)
- `keywords`: Search terms and aliases for the item
- `is_recyclable`: Boolean indicating if item is accepted in curbside recycling
- `bin_type`: recycling, trash, or special
- `preparation_required`: Steps needed before recycling
- `contamination_notes`: Common contamination issues
- `vision_labels`: Google Vision API labels for image recognition
- `material_codes`: Industry standard codes (1-7 for plastics, etc.)
- `notes`: Additional information or special instructions

### drop-off-locations.csv
All recycling and donation drop-off locations in Terre Haute area.

**Fields:**
- `name`: Facility or business name
- `type`: Category of location (county_facility, retail_recycling, donation, etc.)
- `address`: Full street address
- `lat`: Latitude coordinate
- `lng`: Longitude coordinate
- `phone`: Contact phone number
- `hours`: Operating hours
- `materials_accepted`: Comma-separated list of accepted materials
- `fees`: Any fees charged
- `requirements`: Special requirements (residency, condition, etc.)
- `notes`: Additional information

### collection-zones.csv
Residential collection zones for curbside pickup.

**Fields:**
- `zone_id`: Unique identifier for the zone
- `zone_name`: Human-readable zone name
- `description`: Geographic description
- `recycling_day`: Day of week for recycling collection
- `recycling_frequency`: biweekly_odd, biweekly_even, or weekly
- `trash_day`: Day of week for trash collection
- `boundaries`: Detailed boundary streets
- `notes`: Special notes about the zone

### special-events.csv
Recurring and special recycling events.

**Fields:**
- `event_name`: Name of the event
- `event_type`: Category (electronics, hazardous, shredding, etc.)
- `frequency`: How often event occurs
- `typical_months`: Months when event typically happens
- `location`: Where event takes place
- `materials_accepted`: What can be brought
- `restrictions`: Limitations or requirements
- `contact`: Phone number for information

### material-mapping.csv
Maps computer vision labels to local recycling rules.

**Fields:**
- `vision_label`: Label from Google Vision API
- `material_type`: General material category
- `local_category`: Local recycling category
- `is_recyclable`: Boolean for curbside acceptance
- `special_handling`: Required preparation or alternative disposal

### contamination-items.csv
Common recycling contamination issues ranked by frequency.

**Fields:**
- `item`: Contaminating item
- `reason`: Why it's a problem
- `proper_disposal`: Correct disposal method
- `frequency_rank`: How often this contamination occurs (1=most common)

### holidays.csv
Holiday schedule changes for collection services.

**Fields:**
- `holiday`: Holiday name
- `date_2024`: Date in 2024
- `date_2025`: Date in 2025
- `schedule_change`: How collection schedule is affected

### contacts.csv
Important contacts for recycling and waste services.

**Fields:**
- `organization`: Organization name
- `role`: Primary service provided
- `phone`: Contact phone
- `email`: Contact email
- `website`: Organization website
- `hours`: Business hours

## Data Validation Rules

### Coordinates
- Latitude must be between 39.4 and 39.5 (Terre Haute area)
- Longitude must be between -87.5 and -87.3 (Terre Haute area)

### Phone Numbers
- Format: XXX-XXX-XXXX or empty string
- Area codes: 812 (local), 317 (Indianapolis), 800/888 (toll-free)

### Material Codes
- Plastics: 1-7 following recycling symbols
- Metals: ALU (aluminum), FE (steel/iron)
- Paper: OCC (cardboard), ONP (newspaper), OMG (magazines)

### Boolean Fields
- Use true/false (lowercase) for consistency
- Never use yes/no or 1/0

### Date Format
- ISO 8601: YYYY-MM-DD
- Times in 12-hour format with am/pm

## Update Procedures

### Quarterly Updates Required
1. Contact Republic Services for any route changes
2. Verify drop-off location hours and fees
3. Check Vigo County SWMD for event schedule
4. Update holiday dates for next year

### Annual Updates Required
1. Full verification of all drop-off locations
2. Review contamination rankings with hauler
3. Update material acceptance policies
4. Verify all phone numbers and websites

### Immediate Updates Needed When
1. Drop-off location closes or changes hours
2. Material acceptance policy changes (like glass in Feb 2024)
3. Collection zone boundaries change
4. New special events are announced

## Usage Notes

### For Developers
- All CSV files are UTF-8 encoded
- Use proper CSV parsing libraries to handle quoted fields
- Coordinates are in WGS84 (standard GPS)
- Empty fields should be treated as "unknown" not "none"

### For Data Entry
- Always verify addresses with Google Maps
- Test phone numbers before entry
- Use consistent capitalization (Title Case for names)
- Include both common and technical terms in keywords

### For App Features
- Use `vision_labels` field for image recognition matching
- `frequency_rank` in contamination can prioritize education
- `requirements` field may need parsing for bullet points
- Hours strings may need parsing for day/time queries

## Quality Assurance Checklist
- [ ] All phone numbers tested
- [ ] All addresses geocoded correctly
- [ ] No duplicate entries
- [ ] Consistent formatting throughout
- [ ] All required fields populated
- [ ] Special characters properly escaped
- [ ] File encodings verified as UTF-8
- [ ] Cross-references between files verified

## Contact for Updates
For corrections or updates to this data, contact:
- Vigo County Solid Waste Management District: 812-231-4451
- City of Terre Haute: 812-232-4000