# AI-Assisted Journal System Architecture

## 1. Scaling to 100k Users
To handle 100k users, the architecture should evolve from a single server to:
- **Load Balancing**: Use Nginx or AWS ALB to distribute traffic across multiple Node.js instances.
- **Microservices**: Separate the LLM analysis into a dedicated microservice to prevent long-running tasks from blocking the main API.
- **Database Scaling**: Implement MongoDB Sharding and use Read Replicas to handle high read/write volume.
- **Stateless Backend**: Ensure the Express server is stateless to allow easy horizontal scaling.

## 2. Reducing LLM Cost
- **Prompt Engineering**: Use concise prompts to reduce token usage.
- **Batching**: If immediate analysis isn't required, batch entries and process them together.
- **Smaller Models**: Use faster/cheaper models (like Gemini Pro Flash) for simple sentiment analysis.
- **Conditional Processing**: Only analyze entries above a certain word count or upon user request.

## 3. Caching Repeated Analysis
- **Implementation**: I have implemented a server-side caching layer using `node-cache`.
- **Strategy**: Before calling the Gemini API, the system checks if the exact text has been analyzed recently.
- **Distributed Cache**: For multiple server instances, use **Redis** instead of local memory to share the cache across all nodes.

## 4. Protecting Sensitive Journal Data
- **Encryption at Rest**: Enable MongoDB Atlas encryption to protect data on disk.
- **Encryption in Transit**: Use HTTPS/SSL for all communications between frontend and backend.
- **PII Scrubbing**: Before sending text to the LLM, use regex or NLP tools to remove PII (Personally Identifiable Information) like names, phone numbers, or addresses.
- **JWT Authentication**: Although not fully implemented in this MVP, a production system would use JWT tokens to ensure users can only access their own entries.
