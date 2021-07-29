//variables for data objects
const DATASETS = {
  videogames: {
    TITLE: 'Video Game Sales',
    DESCRIPTION: 'Top 100 Most Sold Video Games Grouped by Platform',
    FILE_PATH:
    'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json' },

  movies: {
    TITLE: 'Movie Sales',
    DESCRIPTION: 'Top 100 Highest Grossing Movies Grouped By Genre',
    FILE_PATH:
    'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json' },

  kickstarter: {
    TITLE: 'Kickstarter Pledges',
    DESCRIPTION:
    'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
    FILE_PATH:
    'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json' } };



//creates variable for query string of url and returns search params object **can we review
var urlParams = new URLSearchParams(window.location.search);

//default data variable
const DEFAULT_DATASET = 'videogames';
//creates variable that looks at html in window and gets the data based on the search params in the href - or defaults to videogames
const DATASET = DATASETS[urlParams.get('data') || DEFAULT_DATASET];

//sets inner html of title header with dataset title
document.getElementById('title').innerHTML = DATASET.TITLE;
//sets description div with dataset description
document.getElementById('description').innerHTML = DATASET.DESCRIPTION;

// body variable that selects body
var body = d3.select('body');

// Creates div variable for tooltip
var tooltip = body.
append('div').
attr('class', 'tooltip').
attr('id', 'tooltip').
style('opacity', 0);

//create var for svg selecting tree map
var svg = d3.select('#tree-map'),
width = +svg.attr('width'),
height = +svg.attr('height');

//creates blend between argument color and white - the higher the second argument of .2 the whiter/lighter it is
var fader = function (color) {
  return d3.interpolateRgb(color, '#fff')(0.2);
},
//creates variable for color argument, uses preset color scheme and maps through it to apply faded colors
color = d3.scaleOrdinal(d3.schemeCategory20.map(fader));

//creates treemap using built in function that creates nested rectangles
var treemap = d3.treemap().size([width, height]).paddingInner(1);

//uses built in json to pull json data from the file path oject
d3.json(DATASET.FILE_PATH, function (error, data) {
  if (error) {
    throw error;
  }

  //uses built in heirarchy to used the nested json objects to map out a 'tree'
  var root = d3.
  hierarchy(data)
  //each before performs the function on a node of the tree and each child after it
  .eachBefore(function (d) {
    //conditional statement that checks if d has a parent key, then the data.id is from the parent key, or it will just be data name - the id is video game sales data top 100 taken from the parent, plus the game name and console
    d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
  })
  //sums array by values
  .sum(sumBySize).
  sort(function (a, b) {
    //sorts through array and returns them in order, minusing the height of a from  b, or the value
    return b.height - a.height || b.value - a.value;
  });

  //runs the treemap and returns array of nodes that are associated with the 'base node'
  treemap(root);

  //creates cell variable with g container - appends data to g using the root leaves - nodes with no children
  var cell = svg.
  selectAll('g').
  data(root.leaves()).
  enter().
  append('g').
  attr('class', 'group').
  attr('transform', function (d) {
    return 'translate(' + d.x0 + ',' + d.y0 + ')';
  });

  cell
  //appends rects to g container cells, gives id attribute using data id
  .append('rect').
  attr('id', function (d) {
    return d.data.id;
  }).
  attr('class', 'tile').
  attr('width', function (d) {
    return d.x1 - d.x0;
  }).
  attr('height', function (d) {
    return d.y1 - d.y0;
  })
  //gives name category and value attributes returning data from arrays
  .attr('data-name', function (d) {
    return d.data.name;
  }).
  attr('data-category', function (d) {
    return d.data.category;
  }).
  attr('data-value', function (d) {
    return d.data.value;
  }).
  attr('fill', function (d) {
    return color(d.data.category);
  })
  //creates mouseover function for tooltip
  .on('mousemove', function (d) {
    tooltip.style('opacity', 0.9);
    tooltip
    //places inner html in tooltip based on array values
    .html(
    'Name: ' +
    d.data.name +
    '<br>Category: ' +
    d.data.category +
    '<br>Value: ' +
    d.data.value).

    attr('data-value', d.data.value)
    //places tooltip on pages
    .style('left', d3.event.pageX + 10 + 'px').
    style('top', d3.event.pageY - 28 + 'px');
  })
  //removes tooltip when you mouseout
  .on('mouseout', function () {
    tooltip.style('opacity', 0);
  });

  cell
  //appends text to leaf cells
  .append('text').
  attr('class', 'tile-text').
  selectAll('tspan').
  data(function (d) {
    //splits the data names into ordered array, based on matching from A-Z regex, makes it so the text is inline with the cell 
    return d.data.name.split(/(?=[A-Z][^A-Z])/g);
  }).
  enter().
  append('tspan').
  attr('x', 4).
  attr('y', function (d, i) {
    return 13 + i * 10;
  }).
  text(function (d) {
    return d;
  });
  //creates var that maps through the children nodes and returns each category they're in
  var categories = root.leaves().map(function (nodes) {
    return nodes.data.category;
  });
  //filters through the category and returns t
  categories = categories.filter(function (category, index, self) {
    return self.indexOf(category) === index;
  });
  //selects the element with legend id
  var legend = d3.select('#legend');
  var legendWidth = +legend.attr('width');
  //creates variables for legend attributes
  const LEGEND_OFFSET = 10;
  const LEGEND_RECT_SIZE = 15;
  const LEGEND_H_SPACING = 150;
  const LEGEND_V_SPACING = 10;
  const LEGEND_TEXT_X_OFFSET = 3;
  const LEGEND_TEXT_Y_OFFSET = -2;
  var legendElemsPerRow = Math.floor(legendWidth / LEGEND_H_SPACING);

  //appends g container and places it
  var legendElem = legend.
  append('g').
  attr('transform', 'translate(60,' + LEGEND_OFFSET + ')').
  selectAll('g')
  //adds categories data and appends g containers
  .data(categories).
  enter().
  append('g').
  attr('transform', function (d, i) {
    //places legend with variables
    return (
      'translate(' +
      i % legendElemsPerRow * LEGEND_H_SPACING +
      ',' + (
      Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE +
      LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)) +
      ')');

  });

  //appends rect to legend and fills with appropriate color based on data 
  legendElem.
  append('rect').
  attr('width', LEGEND_RECT_SIZE).
  attr('height', LEGEND_RECT_SIZE).
  attr('class', 'legend-item').
  attr('fill', function (d) {
    return color(d);
  });

  //appends texts to legend with data 
  legendElem.
  append('text').
  attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET).
  attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET).
  text(function (d) {
    return d;
  });
});

//function used in sort - returns value of video game
function sumBySize(d) {
  return d.value;
}