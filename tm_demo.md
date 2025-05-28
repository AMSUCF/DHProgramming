## Demo: Working with Teachable Machine

First, gather at least 10 sample images from at least 3 different categories. For my demo dataset, I’m using cover images from distinct titles of [comic book covers](https://www.coverbrowser.com/). You might try different art styles, architecture, palettes, animal types, etc. Remember to think about these as distinct sets - you’ll need to categorize your inputs into specific labels, which in turn the model will try to place content.

Next, launch [Teachable Machine](https://teachablemachine.withgoogle.com/train), a simple visual interface for training machine learning models and exporting them for web applications. Select New Image Project -> Standard image model to start training your model.

Upload the images from each category, labeling them as you go (as shown above). Then, train the model and export it by selecting the options Tensorflow.js and Upload (shareable link). Copy the resulting link.

Next, we’re going to set up a tool that will let you test your model against other images that fall in the same categories. This tool is one I built that is going to give you a simple framework - you only need to replace one line of code to make it work. Load the [sample application](https://openprocessing.org/sketch/2382215), select </>, and replace the URL in line 4 with your URL to test your model.