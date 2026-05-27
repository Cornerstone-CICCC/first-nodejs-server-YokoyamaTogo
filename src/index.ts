import * as http from "http"

const port = 3000

const server = http.createServer((request, response) => {
  response.end("Hello World")
})

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
