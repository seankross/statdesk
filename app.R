library(shiny)
library(shinyjqui)

state <<- list(count = 1)

die <- function() {
  name <- paste0("die", state$count)
  state$widgets <- c(state$widgets, name)
  wellPanel(class="widget",
            h3(name),
            sliderInput(paste0(name, "_times"), "Roll how many times?", 1, 100, 1),
            textOutput(paste0(name, "_value")),
            actionButton(paste0(name, "_roll"), "Roll")
  )
}

histogram <- function() {
  name <- paste0("histogram", state$count)
  state$widgets <- c(state$widgets, name)
  wellPanel(class="widget",
            h3(name),
            #textInput(paste0(name, "_gen"), "Data Generator"),
            #actionButton(paste0(name, "_link"), "Link"),
            plotOutput("hist2")
  )
}

line_ <- function() {
  name <- paste0("line", state$count)
  state$widgets <- c(state$widgets, name)
  wellPanel(class="widget",
            h3(name),
            #textInput(paste0(name, "_gen"), "Data Generator"),
            #actionButton(paste0(name, "_link"), "Link"),
            plotOutput("line3")
  )
}

server <- function(input, output) {
  values <- reactiveValues()
  
  observeEvent(input$create_widget, {
    if (input$widget_select == "Die" && state$count == 1) {
      #div(HTML())
      insertUI("#desk", "beforeEnd", jqui_draggabled(
        die()
      ))
      state$count <<- state$count + 1
    } else if (input$widget_select == "Histogram" && state$count == 2) {
      insertUI("#desk", "beforeEnd", jqui_draggabled(
        histogram()
      ))
      state$count <<- state$count + 1
    } else if (input$widget_select == "Average" && state$count == 3) {
      insertUI("#desk", "beforeEnd", jqui_draggabled(
        line_()
      ))
      state$count <<- state$count + 1
    }
  })
  
  observeEvent(input$die1_roll, {
    value <- sample(1:6, input$die1_times, replace = TRUE)
    state$die1 <<- c(state$die1, value)
    output$die1_value <- renderText(value)
  })
  
  output$hist2 <- renderPlot({
    input$die1_roll
    
    if (is.null(state[["die1"]])) {
      plot.new()
    } else {
      state$die1_mean <<- c(state$die1_mean, mean(state[["die1"]]))
      barplot(table(state[["die1"]]))
    }
  })
  
  output$line3 <- renderPlot({
    input$die1_roll
    
    if (is.null(state[["die1"]])) {
      plot.new()
    } else {
      plot(state[["die1_mean"]], type = "l", ylab = "Average")
    }
  })
  
}

ui <- fluidPage(
  includeCSS("stylesheet.css"),
  titlePanel("StatDesk"),
  sidebarLayout(
    sidebarPanel(
      selectInput("widget_select", "Choose Widget",
                  c("Die", "Histogram", "Average")
      ),
      actionButton("create_widget", "Create")
    ),
    mainPanel(
      div(id="desk")
      #,jqui_draggabled(fileInput('file', 'File'))
    )
  )
)

shinyApp(ui, server)
