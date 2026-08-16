# Testing Checklist for Portfolio App

## Home Page Tests
- [ ] Hero section loads with profile image
- [ ] Animations are smooth and not janky
- [ ] Stats section displays correctly
- [ ] Scroll indicator animates
- [ ] Cards grid is responsive
- [ ] CTA button is clickable

## Navigation Tests
- [ ] Navigation bar is sticky
- [ ] Mobile menu opens/closes
- [ ] Active link indicator works
- [ ] All links navigate correctly
- [ ] Logo takes you home

## About Page Tests
- [ ] Profile image loads
- [ ] Profile bio displays correctly
- [ ] Experience section shows all entries
- [ ] Education section shows all entries
- [ ] Social icons are functional
- [ ] Responsive layout on mobile

## Works/Projects Page Tests
- [ ] Carousel loads and displays projects
- [ ] Project cards scale on hover
- [ ] Modal opens when clicking a project
- [ ] Modal closes properly
- [ ] Live Demo and View Code links work
- [ ] Technologies and features display correctly
- [ ] Navigation arrows work
- [ ] Keyboard navigation works (arrow keys)

## Contact Page Tests
- [ ] Contact form loads
- [ ] Form validation works:
  - [ ] Name field validation
  - [ ] Email field validation
  - [ ] Subject field validation
  - [ ] Message field validation
- [ ] Submit button works
- [ ] Success message appears on submit
- [ ] Form resets after submission
- [ ] Error handling works
- [ ] Contact info displays correctly
- [ ] Social icons are clickable

## Resume Page Tests
- [ ] Download button works
- [ ] View button opens resume in new tab
- [ ] Error message shows if URL not configured

## Admin Dashboard Tests
- [ ] Password protection works
- [ ] Can edit home page hero section
- [ ] Can add/remove/edit cards
- [ ] Can update statistics
- [ ] Can edit about profile
- [ ] Can edit experience entries
- [ ] Can edit education entries
- [ ] Can update contact info
- [ ] Can add/remove social links
- [ ] Changes persist after page reload
- [ ] Changes reflect on main site

## Error Page Tests
- [ ] Navigate to `/nonexistent` shows 404
- [ ] Back button works on 404 page
- [ ] Error boundary displays on runtime error
- [ ] Error page is styled consistently

## Responsive Design Tests
- [ ] **Mobile (320px - 640px)**
  - [ ] Text is readable
  - [ ] Images scale properly
  - [ ] Forms are easy to use
  - [ ] Navigation menu works
  - [ ] No horizontal scrolling
  
- [ ] **Tablet (641px - 1024px)**
  - [ ] Layout adjusts properly
  - [ ] Cards display correctly
  - [ ] Carousel works smoothly
  
- [ ] **Desktop (1025px+)**
  - [ ] Full layout displays
  - [ ] Animations are smooth
  - [ ] All features accessible

## Performance Tests
- [ ] Page loads quickly (< 3s)
- [ ] Images load lazily
- [ ] No console errors
- [ ] No hydration mismatches
- [ ] Animations are smooth (60fps)

## SEO Tests
- [ ] Sitemap is accessible at `/sitemap.xml`
- [ ] Robots.txt exists at `/robots.txt`
- [ ] Meta tags are correct
- [ ] Open Graph tags work
- [ ] Page titles are unique
- [ ] Descriptions are present

## Accessibility Tests
- [ ] Can navigate with keyboard Tab key
- [ ] Focus indicators are visible
- [ ] Links have descriptive text
- [ ] Images have alt text
- [ ] Form labels are associated
- [ ] ARIA labels present where needed

## Browser Compatibility Tests
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Mobile Browser Tests
- [ ] iOS Safari
- [ ] Chrome for Android

## Form Submission Tests
- [ ] Contact form submits without error
- [ ] Success message displays
- [ ] Form clears after submission
- [ ] Error handling works
- [ ] Validation prevents submission

## Local Storage Tests
- [ ] Admin changes persist
- [ ] Clear localStorage and reload - defaults load
- [ ] Multiple sessions maintain data

## General Quality Tests
- [ ] No console warnings (except CSS @tailwind)
- [ ] No unused variables
- [ ] Code is properly formatted
- [ ] Comments are clear and helpful
- [ ] No hardcoded values that should be config
- [ ] Proper error messages for users

## Email Service Tests
- [ ] Contact form uses configured email service
- [ ] Emails are received correctly
- [ ] Email formatting looks good
- [ ] Fallback to localStorage if service fails

## Deployment Tests (Before Going Live)
- [ ] Build completes without errors: `npm run build`
- [ ] Production build is smaller than dev
- [ ] Environment variables are set
- [ ] All external services are configured
- [ ] Domains are properly configured
- [ ] SSL certificate is valid
- [ ] DNS records are correct
- [ ] Search engines can crawl (robots.txt allows)

---

## Notes

- Test on real devices when possible, not just browser DevTools
- Test with slow network (throttle in DevTools)
- Clear browser cache between tests
- Test with JavaScript disabled (for critical content)
- Check browser console for errors
- Use Lighthouse for performance audit

## Known Issues

- Placeholder images from `via.placeholder.com` may not load without internet
- TikTok icon uses Music icon as fallback (no TikTok in lucide-react)
- Admin password should be changed from default in production

---

Last Updated: January 2026
