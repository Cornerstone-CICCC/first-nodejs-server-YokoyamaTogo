import * as http from "http"

type Post = {
  id: number
  title: string
  body: string
  userId: number
}

const port = 3000
let posts: Post[] = [
  {
    id: 1,
    title: "First Post",
    body: "Hello World",
    userId: 1,
  },
]
let nextId = 2

const sendJson = (response: http.ServerResponse, data: unknown) => {
  response.setHeader("Content-Type", "application/json")
  response.end(JSON.stringify(data))
}

const server = http.createServer((request, response) => {
  const method = request.method
  const path = request.url ?? ""
  const id = Number(path.split("/")[2])

  if (method === "GET" && path === "/posts") {
    sendJson(response, posts)
    return
  }

  if (method === "GET" && path.startsWith("/posts/")) {
    sendJson(response, posts.find((post) => post.id === id))
    return
  }

  if (method === "DELETE" && path.startsWith("/posts/")) {
    posts = posts.filter((post) => post.id !== id)
    sendJson(response, {})
    return
  }

  if (
    (method === "POST" && path === "/posts") ||
    (method === "PUT" && path.startsWith("/posts/"))
  ) {
    let body = ""

    request.on("data", (chunk) => {
      body += chunk
    })

    request.on("end", () => {
      let data: Partial<Post>

      try {
        data = JSON.parse(body) as Partial<Post>
      } catch {
        response.statusCode = 400
        sendJson(response, { error: "Invalid JSON" })
        return
      }

      if (method === "POST") {
        const post = { ...data, id: nextId++ } as Post
        posts.push(post)
        sendJson(response, post)
        return
      }

      const index = posts.findIndex((post) => post.id === id)
      const currentPost = posts[index]

      if (!currentPost) {
        response.statusCode = 404
        sendJson(response, { error: "Post not found" })
        return
      }

      const post = { ...currentPost, ...data, id }
      posts[index] = post
      sendJson(response, post)
    })
    return
  }

  response.statusCode = 404
  sendJson(response, { error: "Not found" })
})

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
