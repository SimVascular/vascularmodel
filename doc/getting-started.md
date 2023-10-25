# The Vascular Model Repository: getting started with the website

The [Vascular Model Repository](www.vascularmodel.com) (VMR) is a publicly available collection of cardiovascular models and simulations. This guide explains how the website works, how it can be edited, where it is deployed, and how new models can be added to the repository.

# Structure of the website
The website is built using HTML, CSS, and Javascript. The purpose of this section is only to provide the basics of these three languages for the reader to be able to understand the code structure. Some links to relevant tutorials are provided at the end of each subsection.

## HTML
Hyper Text Markup Language (HTML) is a markup language for websites. In HTML files, we define the structure and content of a document (for example, its division into sections and paragraphs), but typically not the way the content is displayed. Here is the typical structure of an HTML document:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Title of the webpage</title>
    <!-- Importing external packages and resources (e.g., fonts) -->
    <!-- We also have snippets related to Google Analytics -->
  </head>
  <body>
    <!-- Actual content of the page -->
    <!-- At the end of the body, we typically import javascript files -->
  </body>
</html>
```

In the body, we define different elements using tags. Elements can be inline or blocks. Examples of inline elements are `<a><\a>` (typically used for links) and `<span><\span>`, while typical block elements are `<div><\div>`. As the name suggests, inline elements can be encapsulated into other elements without line breaks, whereas block elements always start on a new line. 

In this repository, `*.html` files are stored in the root of the project. The main file is `index.html`, which includes the code for the landing page of the website. This is the page that is displayed when users access [www.vascularmodel.com](www.vascularmodel.com).

Links to useful HTML introductions:
1. [HTML Tutorial for Beginners: HTML Crash Course](https://www.youtube.com/watch?v=qz0aGYrrlhU&t=1652s)
2. [HTML Introduction](https://www.w3schools.com/html/html_intro.asp)

## CSS 
Cascading Style Sheets (CSS) is a stylesheet language that describes the appearance of HTML documents. CSS styles are applied to HTML elements based on their classes or ids.

For example, in this HTML snippet from `index.html` we have several snippets of this type:

```html
<div class="team-hover text-center">
    <p style="font-size: 17px">Name of team member</p>
</div>
```

we are defining a `div` element and assigning the class `team-hover` to it. Inside the `div` element, we are including a `p` element.
The style of the `team-hover` element is defined in `css/style.css`:

```css
.team-hover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--dark2);
  opacity: 0;
  -webkit-transition: opacity 0.4s ease-in;
  transition: opacity 0.4s ease-in;
  border-radius: 50% !important;
}
```

Note that the "." in front of a name defines a class, while "#" defines an id. The difference between classes and ids is that ids must be unique in the HTML file.
Moreover, note that styles can also be defined in the HTML (in the example above, the `p` element is assigned a font size of 17 px), but it is typically better to define styles in CSS files.
CSS files are included in the head of HTML documents. For example, in `index.html`:

```html
<link rel="stylesheet" href="css/style.css?v=1.0.2" />
```

Assigning a version number to a CSS file forces browsers to update the stylesheets when the same website is accessed multiple times. It might be useful to increase the version number if particular changes in stylesheets are not reflected in the browser when deployed online. 

Links to useful CSS introductions:
1. [CSS Tutorial](https://www.w3schools.com/css/)
2. [Learn CSS in 20 Minutes](https://www.youtube.com/watch?v=1PnVor36_40)

## Javascript
Contrarily to HTML and CSS, Javascript is a complete programming language that allows the definition of variables and functions. Generally speaking, Javascript allows us to implement non trivial functionality in websites. 

Our Javascript code is located in the `js` folder. Most of the functionality of our website is implemented using Javascript is related to the Dataset page. At the end of `dataset.html` is the list of scripts that are used by the Dataset page. Note that the order matters, and variables/functions used in each of these scripts should be defined in the script itself or in scripts previously imported. 

```html
<script src="js/globalVar.js?v=1.0.6"></script>
<!-- ... -->
<script src="js/main.js?v=1.1.9"></script>
<script src="js/filters.js?v=1.0.8"></script>
<script src="js/buttons.js?v=1.0.5"></script>
```


In particular, the Dataset page is populated by reading the list of models from  `dataset/dataset-svprojects.csv`. This file contains one row per each model in the repository. Each of these rows contains details on the model itself, for example where demographic data about the patient and any relevant references. This is the way the `.csv` is read when `dataset.html` is opened:

```javascript
$(document).ready(function($){
  //reads csv file and sets it to the global variable data
  $.ajax({
    type: "GET",
    url: "https://www.vascularmodel.com/dataset/dataset-svprojects.csv",
    dataType: "text",
    async: false,
    success: function(fdata) {
      data = $.csv.toObjects(fdata);
      //saves the csv order of the models in preservedOrderData
      for(var i = 0; i < data.length; i++)
      {
        preservedOrderData.push(data[i]);
      }
      // we shuffle array to make it always different
      data.sort(() => (Math.random() > .5) ? 1 : -1);
    }
  });
  // ...
```

The syntax `$(document).ready(function($)` defines a jQuery function that gets executed when the document is first launched (see "External Packages" section for more information on jQuery). Similarly, `ajax` is an asynchronous HTTP request used to open `https://www.vascularmodel.com/dataset/dataset-svprojects.csv` and populate the `data` array.

Links to useful Javascript introductions:
1. [Javascript](https://www.w3schools.com/js/js_intro.asp)

## External Packages
 The VMR website relies on a few external packages that provide useful functionality. Below is a list of the most important ones. Please visit the documentation of each for more information.
 1. [Boostrap](https://getbootstrap.com): Bootstrap mainly provides tools to organize the content of webpages in a responsive manner (based on the screen size). The way this is done in our code is mostly as follows:
     ```html
     <div class="container">
            <div class="row">
              <div class="col-md-4 col-sm-12">
                <div class="icon"><i class="fa-solid fa-2xl fa-book"></i></div>
                <div class="info">
                  <h4>What it is</h4>
                  <p>
                    A library of computational models of normal and diseased
                    cardiovascular models.
                  </p>
                </div>
              </div>
        <!-- ... -->
     ```
     
     Our content is usually divided into columns whose lenght depends on the screen size. The horizontal space is ideally divided into 12 parts, and the width column is determined by how many "twelveths" that column takes on a screen of a given size. In the example above, the third `div` class defines an element that takes a third of a column on medium screen or larger, or a single column on small screens.
2. [Fontawesome](https://fontawesome.com): this is a small library that allows us to download icons with simple HTML calls. For example
    ```html
    <div class="icon"><i class="fa-solid fa-2xl fa-heart"></i></div>
    ```
    Creates an icon of a heart. The list of available icons can be found [here](https://fontawesome.com/icons).
3. [jQuery](https://jquery.com): this is a Javascript library that allows manipulating HTML elements programmatically. For example:
    ```javascript
    document.getElementById('selected-counter').textContent = count;
    ```
    selects the element with id `selected-counter` from the current document and assigns text to it.
