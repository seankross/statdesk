library(shiny)
library(shinyjqui)

state <<- list(count = 1)

die <- function() {
  name <- paste0("die", state$count)
  wellPanel(class="widget",
            h3(name),
            textInput(paste0(name, "_times"), "Roll how many times?", 1),
            textOutput(paste0(name, "_value")),
            actionButton(paste0(name, "_roll"), "Roll")
  )
}

server <- function(input, output) {
  values <- reactiveValues()
  
  observeEvent(input$create_widget, {
    if (input$widget_select == "Die") {
      #div(HTML())
      insertUI("#desk", "beforeEnd", jqui_draggabled(
        die()
      ))
      state$count <<- state$count + 1
    }
  })
  
  observeEvent(input$die1_roll, {
    value <- sample(1:6, 1)
    state$die1 <<- c(state$die1, value)
    output$die1_value <- renderText(value)
  })
  
}

ui <- fluidPage(
  includeCSS("stylesheet.css"),
  titlePanel("StatDesk"),
  sidebarLayout(
    sidebarPanel(
      selectInput("widget_select", "Choose Widget",
                  c("Die", "Clock")
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
