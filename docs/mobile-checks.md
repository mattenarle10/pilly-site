# Mobile and Safari verification

## Coverage boundary

Target: iOS Safari 16.4+ and current desktop Safari, Chrome, Edge, and Firefox.
Automated CI uses Playwright Chromium, Firefox, and WebKit. Its iPhone/iPad
projects emulate device settings; they do not run the released iOS browser.
Historical iOS 16.4 compatibility remains unverified until that version is tested
on a device or an appropriate device service. Do not label WebKit results as
real-device Safari results.

## Open the local export on your iPhone

Keep the phone and Mac on the same trusted Wi-Fi network. From this repo:

```sh
bun run build
bunx serve out --listen tcp://0.0.0.0:4173 --no-clipboard
```

Open the Network URL printed by serve in iPhone Safari. If needed,
`ipconfig getifaddr en0` prints the Mac's Wi-Fi address; use
`http://<that-address>:4173`. Allow the local connection in the macOS firewall
if prompted. Stop the preview with Ctrl-C when finished. The normal `preview`
command stays bound to localhost. A Vercel preview can be used after publishing.

## On-device checklist

Record the device model and iOS version with the result.

- Reload at the top and partway down, including on a slow connection. The headline
  and buttons must not disappear and return, and the layout must not jump.
- Scroll all four landing sections slowly, quickly, and backward. Containers and
  their cards should settle together, with controls staying aligned to their panel.
- Swipe the medicine ribbon to both ends. The last card must remain reachable;
  vertical scrolling should still work when a gesture begins over the ribbon.
- Rotate portrait -> landscape -> portrait, both at the top and halfway down.
  Expand/collapse Safari's address bar. Check for jumping, cropped copy, and controls
  under the notch or home indicator.
- Change medicine form and color; verify the preview and selected states.
- Increase Safari Page Zoom to 200%. Text may wrap differently, but content and
  navigation must remain reachable without accidental page-wide horizontal overflow.
- Open Privacy, Terms, and Support, reach their footer links, and return to the
  landing page using both the page link and Safari Back. Check scroll and motion again.
- Enable Settings -> Accessibility -> Motion -> Reduce Motion. Return to Safari;
  cards must stop moving and content must remain visible. Disable it and check again.
- Check the early-access mail link manually. Automated tests do not send email.

## Safari performance recording

This requires an attached device and Safari Web Inspector; Playwright traces
are not a substitute for this check.

1. Enable Web Inspector on the iPhone under Safari's Advanced settings and enable
   Safari's web developer features on the Mac. Connect and trust the phone.
2. Open the phone's page from the Mac Safari Develop menu. Record Timelines while
   scrolling through the landing page, swiping the ribbon, and reversing direction.
3. Look for visible frame stalls and repeated Layout work attributable to card
   animation. Cards animate transforms only; resize/rotation may legitimately
   trigger new measurements. Do not infer device frame-rate guarantees from CI.
4. Save the device/version, observed problem (if any), and recording under ignored
   `test-results/` when sharing locally. Do not commit device recordings or logs.

## First-party references

- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP React cleanup](https://gsap.com/resources/React/)
- [Playwright browser coverage](https://playwright.dev/docs/browsers)
- [WebKit safe areas](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
- [WebKit viewport units](https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/)
- [Safari 17.4 block alignment](https://webkit.org/blog/15063/webkit-features-in-safari-17-4/)
- [Safari 17.5 text wrapping](https://webkit.org/blog/15383/webkit-features-in-safari-17-5/)
