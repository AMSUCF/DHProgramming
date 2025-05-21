## Exercise: Image Scraping

For this exercise, we'll build on the scraping we did with Python previously, and use it to create a dataset for training our own simple image classification model. 

Pick an image source that allows scraping, for instance, our sample target site is [comic covers](https://www.coverbrowser.com/) - the scraping rules are noted in the [robots.txt file](https://www.coverbrowser.com/robots.txt).

Prompt the Python code with specific information on the pages - you may need to provide several details. For example, here's a few iterations refining the sample dataset:

- Write a Python scraper to download all the images from this page: https://www.coverbrowser.com/covers/batman
- The second page is formatted like this - https://www.coverbrowser.com/covers/batman/2 - please modify this so it will handle 5 pages in that format, saving each image as batman_(number)
- Please rewrite this to do the same thing for the first five pages of Superman - here's the first page url: https://www.coverbrowser.com/covers/superman
- Zip batman_images 
- Zip superman_images 

This will prepare the datasets you need for experimenting with Teachable Machine.