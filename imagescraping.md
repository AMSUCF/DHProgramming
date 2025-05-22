## Exercise: Image Scraping and Teachable Machine

For this exercise, we'll build on the scraping we did with Python previously, and use it to create a dataset for training our own simple image classification model. 

Pick an image source that allows scraping, for instance, our sample target site is [comic covers](https://www.coverbrowser.com/) - the scraping rules are noted in the [robots.txt file](https://www.coverbrowser.com/robots.txt).

Prompt the Python code with specific information on the pages - you may need to provide several details. For example, here's a few iterations refining the sample dataset:

- Write a Python scraper to download all the images from this page: https://www.coverbrowser.com/covers/batman
- The second page is formatted like this - https://www.coverbrowser.com/covers/batman/2 - please modify this so it will handle 5 pages in that format, saving each image as batman_(number)
- Please rewrite this to do the same thing for the first five pages of Superman - here's the first page url: https://www.coverbrowser.com/covers/superman
- Zip batman_images 
- Zip superman_images 

Next, launch [Teachable Machine](https://teachablemachine.withgoogle.com/train), a simple visual interface for training machine learning models and exporting them for web applications. Select New Image Project -> Standard image model to start training your model.

Upload the images from each category, labeling them as you go (as shown above). Then, train the model and export it by selecting the options Tensorflow.js and Upload (shareable link). Copy the resulting link.

Next, we’re going to set up a tool that will let you test your model against other images that fall in the same categories. This tool is one I built that is going to give you a simple framework - you only need to replace one line of code to make it work. Load the [sample application](https://openprocessing.org/sketch/2382215), select </>, and replace the URL in line 4 with your URL to test your model.