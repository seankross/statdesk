var state = {};
state.widgets = {};
state.number = 0;
state.data_generating_object_names = [];

function sidebarText(value) {
  var button_template = '<div id="sidebar-text" class="align-items-center px-3 mt-4 mb-1">' +
  '<button type="button" class="btn btn-primary" id="die-button">{{button_text}}</button>' +
  '</div>';

  if (value === "die") {
    return Mustache.render(button_template, {button_text: "Make New Die"});
  } else if (value === "hist") {
    return Mustache.render(button_template, {button_text: "Make New Histogram"});
  } else {
    return Mustache.render(button_template, {button_text: "None"});
  }
}

$("#widget-sidebar-select").change(function() {
  var widget_selection = $( "select option:selected" ).val();
  $( "#sidebar-text" ).remove();
  $("#widget-sidebar").append(sidebarText(widget_selection));
}).trigger("change");

$("#die-button").click(function () {
  var die_template =
  '<div class="card" style="width: 18rem;">' +
    '<div class="card-body">' +
      '<h5 class="card-title">' +
        'die{{number}}' +
      '</h5>' +
      '<button type="button" class="btn btn-primary" id="die-roll-button-{{number}}">Roll</button>' +
      // '<div>' +
      //   '<canvas id="die{{number}}-chart"> width="100" height="100"></canvas>' +
      // '</div>' +
      '{{die_chart}}' +
    '</div>' +
  '</div>';

  var card = $(Mustache.render(die_template, {number: state.number}));
  $( "#desk" ).append( card.draggable() );
  var click_id = ("#die-roll-button-" + state.number).slice();
  $(click_id).click(function() {
    console.log(click_id);
    var publish_id = ("/die-roll-" + click_id.slice(-1)).slice();
    publish(publish_id);
  });

  state.number += 1;
});

var handle = subscribe("/die-roll-0", function(){
  console.log("0");
  // var roll = Math.floor((Math.random() * 6) + 1);
  // myChart.data.datasets[0].data[roll - 1] += 1;
  // myChart.data.datasets[0].history.push(myChart.data.datasets[0].data.slice());
  // myChart.update();
});

var handle = subscribe("/die-roll-1", function(){
  console.log("1");
  // var roll = Math.floor((Math.random() * 6) + 1);
  // myChart.data.datasets[0].data[roll - 1] += 1;
  // myChart.data.datasets[0].history.push(myChart.data.datasets[0].data.slice());
  // myChart.update();
});

// var ctx = document.getElementById("myChart").getContext('2d');
// var myChart = new Chart(ctx, {
//     type: 'bar',
//     data: {
//         labels: ["1", "2", "3", "4", "5", "6"],
//         datasets: [{
//             label: 'Number of Times Rolled',
//             data: [0, 0, 0, 0, 0, 0],
//             history: [[0, 0, 0, 0, 0, 0]],
//             backgroundColor: [
//                 'rgba(255, 99, 132, 0.2)',
//                 'rgba(54, 162, 235, 0.2)',
//                 'rgba(255, 206, 86, 0.2)',
//                 'rgba(75, 192, 192, 0.2)',
//                 'rgba(153, 102, 255, 0.2)',
//                 'rgba(255, 159, 64, 0.2)'
//             ],
//             borderColor: [
//                 'rgba(255,99,132,1)',
//                 'rgba(54, 162, 235, 1)',
//                 'rgba(255, 206, 86, 1)',
//                 'rgba(75, 192, 192, 1)',
//                 'rgba(153, 102, 255, 1)',
//                 'rgba(255, 159, 64, 1)'
//             ],
//             borderWidth: 1
//         }]
//     },
//     options: {
//         scales: {
//             yAxes: [{
//                 ticks: {
//                     beginAtZero:true
//                 }
//             }]
//         }
//     }
// });
