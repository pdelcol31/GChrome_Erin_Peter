## AI Impact Tracker
This repository contains the code for AI Impact Tracker, a Chrome extension that reports estimates of the environmental footprint of ChatGPT responses (on the website) by tracking the number of output tokens (similar to words) in a response. Using the user's coarse location, based on the country, or state or province and watershed (if in the United States or Canada), the extension reports estimates of the carbon, water, and energy usage associated with that activity. The extension collects the number of output tokens in a generated response and coarse location data and securely and anonymously sends this to a backend server that both performs the calculations and displays and analyzes aggregated usage and environmental data on a public facing website to consider larger-scale impacts of generative AI.

## Related Resources
If you are interested in installing the extension to track your own ChatGPT usage: https://chromewebstore.google.com/detail/ai-impact-tracker/gopcpgaafebifedebipjgfnmmiogddaj?

If you are interested in seeing the aggregated data see our website: https://aiimpacttracker.cs.haverford.edu/

If you are interested in the backend server code where energy, water, and carbon calculations are performed: https://github.com/Erin-Dougherty/AI-Impact-Tracker-Calculations
