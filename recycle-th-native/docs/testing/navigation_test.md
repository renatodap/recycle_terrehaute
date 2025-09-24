# Test Plan: Navigation

## Unit Tests
- TabNavigator renders all 4 tabs
- Tab icons change color when active
- Tab labels are properly displayed
- Stack navigation pushes/pops screens correctly
- Back handler works on Android
- Deep links navigate to correct screens

## Integration Tests
- User can navigate between all tabs
- Navigation state persists during app lifecycle
- Deep linking from notifications works
- Tab badge updates for notifications
- Navigation animations complete smoothly

## E2E Tests (Detox)
- Complete user journey through all tabs
- Navigate to nested screens and back
- Handle app backgrounding/foregrounding
- Test deep link navigation
- Verify accessibility navigation

## Coverage Target: ≥80%