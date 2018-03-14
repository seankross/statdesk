// Global State

var state = {};
state.widgets = {};
state.number = 0;
state.data_generating_object_names = [];
state.colors = ["#3e95cd", "#8e5ea2", "#3cba9f", "#c45850"];
state.colors_index = 0;

function get_color() {
  var result = state.colors[state.colors_index];
  if (state.colors_index === 3) {
    state.colors_index = 0;
  } else {
    state.colors_index += 1;
  }
  return result;
}

// The Sidebar

function sidebarText(value) {
  var die_select_template = '<div id="sidebar-text-{{kind}}" class="align-items-center px-3 mt-4 mb-1">' +
  '<button type="button" class="btn btn-primary" id="{{kind}}-button">{{button_text}}</button>' +
  '</div>';

  var hist_select_template = '<div id="sidebar-text-{{kind}}" class="align-items-center px-3 mt-4 mb-1">' +
    '<select class="custom-select " id="hist-sidebar-select">' +
      '{{#dgos}}' +
      '<option value="{{.}}">{{.}}</option>' +
      '{{/dgos}}' +
    '</select>' +
  '<button type="button" class="btn btn-primary" id="{{kind}}-button">{{button_text}}</button>' +
  '</div>';

  var aot_select_template = '<div id="sidebar-text-{{kind}}" class="align-items-center px-3 mt-4 mb-1">' +
    '<select class="custom-select " id="aot-sidebar-select">' +
      '{{#dgos}}' +
      '<option value="{{.}}">{{.}}</option>' +
      '{{/dgos}}' +
    '</select>' +
  '<button type="button" class="btn btn-primary" id="{{kind}}-button">{{button_text}}</button>' +
  '</div>';

  var hist_new_list =
  '<select class="custom-select " id="hist-sidebar-select">' +
    '{{#dgos}}' +
    '<option value="{{.}}">{{.}}</option>' +
    '{{/dgos}}' +
  '</select>'

  var aot_new_list =
  '<select class="custom-select " id="aot-sidebar-select">' +
    '{{#dgos}}' +
    '<option value="{{.}}">{{.}}</option>' +
    '{{/dgos}}' +
  '</select>'

  if (value === "die") {
    return Mustache.render(die_select_template, {button_text: "Make New Die", kind: "die"});
  } else if (value === "hist") {
    return Mustache.render(hist_select_template, {button_text: "Make New Histogram", kind: "hist",
      dgos: state.data_generating_object_names});
  } else if (value === "hist_new_list") {
    return Mustache.render(hist_new_list, {dgos: state.data_generating_object_names});
  } else if (value === "aot"){
    return Mustache.render(aot_select_template, {button_text: "Make New Average Graph", kind: "aot",
      dgos: state.data_generating_object_names});
  } else if (value === "aot_new_list") {
    return Mustache.render(aot_new_list, {dgos: state.data_generating_object_names});
  } else {
    return Mustache.render(button_template, {button_text: "None", kind: "none"});
  }
}

var possible_selections = ["die", "hist", "aot"];

for (var i = 0; i < possible_selections.length; i++) {
  $("#widget-sidebar").append(sidebarText(possible_selections[i]));
}

for (var i = 0; i < possible_selections.length; i++) {
  $("#sidebar-text-" + possible_selections[i]).hide();
}

$("#widget-sidebar-select").change(function() {
  var widget_selection = $( "select option:selected" ).val();

  for (var i = 0; i < possible_selections.length; i++) {
    $("#sidebar-text-" + possible_selections[i]).hide();
  }

  $("#sidebar-text-" + widget_selection).show();

}).trigger("change");

subscribe("/dgos-update", function() {
  $("#hist-sidebar-select").replaceWith(sidebarText("hist_new_list"));
  $("#aot-sidebar-select").replaceWith(sidebarText("aot_new_list"));
});

// Dice

function rollDie() {
  return Math.floor((Math.random() * 6) + 1);
}

function dieAvg(die_array) {
  var result = 0;
  for (var i = 0; i < die_array.length; i++) {
    result += die_array[i];
  }
  return (result / die_array.length);
}

function dieHistoryAverages(die) {
  var result = [];
  for (var i = 1; i < state.widgets[die].history.length; i++) {
    result.push(dieAvg(state.widgets[die].history.slice(0, i)));
  }
  return result;
}

function dieHistoryLabels(die) {
  var result = [];
  for (var i = 0; i < state.widgets[die].history.length; i++) {
    result.push(i + 1);
  }
  return result;
}

function dieHistoryTotals(die) {
  var result = [0, 0, 0, 0, 0, 0];
  for (var i = 0; i < state.widgets[die].history.length; i++) {
    result[state.widgets[die].history[i] - 1] += 1;
  }
  return result;
}

$("#die-button").click(function () {
  var die_template =
  '<div class="card" style="width: 18rem;">' +
    '<div class="card-body">' +
      '<h5 class="card-title">' +
        'die{{number}}' +
      '</h5>' +
      '<h6 id="die-result-{{number}}">' +
        '0' +
      '</h6>' +
      '<button type="button" class="btn btn-primary" id="die-roll-button-{{number}}">Roll</button>' +
      //'{{die_chart}}' +
    '</div>' +
  '</div>';

  var card = $(Mustache.render(die_template, {number: state.number}));
  $( "#desk" ).append( card.draggable() );
  var widget_id = ("die" + state.number).slice();
  state.data_generating_object_names.push(widget_id);
  state.widgets[widget_id] = {};
  state.widgets[widget_id].history = [];

  var click_id = ("#die-roll-button-" + state.number).slice();
  $(click_id).click(function() {
    console.log(click_id);
    var die_id = click_id.slice(-1);
    var roll = rollDie();
    $("#die-result-" + die_id).text(roll);
    state.widgets["die" + die_id].history.push(roll);
    var publish_id = ("/die" + die_id).slice();
    publish(publish_id);
  });

  state.number += 1;
  publish("/dgos-update");
});

// Histograms

$("#hist-button").click(function () {
  var hist_template =
  '<div class="card" style="width: 18rem; height: 20rem;">' +
    '<div class="card-body">' +
      '<h5 class="card-title">' +
        'hist{{number}} <- {{dgo}}' +
      '</h5>' +
      '<canvas id="hist-chart-{{number}}"style="width: 18rem; height: 18rem;"></canvas>' +
    '</div>' +
    // '<div>' +
    //   '<canvas id="hist-chart-{{number}}"> width="100" height="100"></canvas>' +
    // '</div>' +
  '</div>';

  var widget_id = ("hist" + state.number).slice();
  var hist_id = widget_id.slice(-1);
  state.widgets[widget_id] = {};
  state.widgets[widget_id].dgo = $("#hist-sidebar-select").val().slice();

  var card = $(Mustache.render(hist_template, {number: state.number, dgo: state.widgets[widget_id].dgo}));
  $( "#desk" ).append( card.draggable() );

  state.widgets[widget_id].ctx = document.getElementById("hist-chart-" + hist_id).getContext('2d');
  state.widgets[widget_id].handle = subscribe("/" + state.widgets[widget_id].dgo, function() {
    state.widgets[widget_id].chart.data.datasets[0].data = dieHistoryTotals(state.widgets[widget_id].dgo);
    state.widgets[widget_id].chart.update();
  });
  state.widgets[widget_id].chart = new Chart(state.widgets[widget_id].ctx, {
      type: 'bar',
      data: {
          labels: ["1", "2", "3", "4", "5", "6"],
          datasets: [{
              label: 'Number of Times Rolled',
              data: dieHistoryTotals(state.widgets[widget_id].dgo),
              history: [[0, 0, 0, 0, 0, 0]],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255,99,132,1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          },
          legend: {
                  display: false
               }
      }
  });

  state.number += 1;
});

// Average Over Time

$("#aot-button").click(function () {
  var aot_template =
  '<div class="card" style="width: 18rem; height: 20rem;">' +
    '<div class="card-body">' +
      '<h5 class="card-title">' +
        'aot{{number}} <- {{dgo}}' +
      '</h5>' +
      '<canvas id="aot-chart-{{number}}"style="width: 18rem; height: 18rem;"></canvas>' +
    '</div>' +
  '</div>';

  var widget_id = ("aot" + state.number).slice();
  var aot_id = widget_id.slice(-1);
  state.widgets[widget_id] = {};
  state.widgets[widget_id].dgo = $("#aot-sidebar-select").val().slice();

  var card = $(Mustache.render(aot_template, {number: state.number, dgo: state.widgets[widget_id].dgo}));
  $( "#desk" ).append( card.draggable() );

  state.widgets[widget_id].ctx = document.getElementById("aot-chart-" + aot_id).getContext('2d');
  state.widgets[widget_id].handle = subscribe("/" + state.widgets[widget_id].dgo, function() {
    state.widgets[widget_id].chart.data.datasets[0].data = dieHistoryAverages(state.widgets[widget_id].dgo);
    state.widgets[widget_id].chart.data.labels = dieHistoryLabels(state.widgets[widget_id].dgo);

    // if(state.widgets[widget_id].chart.data.labels.length === 0) {
    //   state.widgets[widget_id].chart.data.labels.push(1);
    // } else {
    //   state.widgets[widget_id].chart.data.labels.push(state.widgets[widget_id].chart.data.labels.slice(-1) + 1);
    // }
    state.widgets[widget_id].chart.update();
  });
  state.widgets[widget_id].chart = new Chart(state.widgets[widget_id].ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
        data: [],
        label: widget_id,
        borderColor: get_color(),
        fill: false
      }]
  },
  options: {
    legend: {
            display: false
         }
  }
});

  state.number += 1;
});
