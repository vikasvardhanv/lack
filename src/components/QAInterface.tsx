import React, { useState } from 'react';
import { Search, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

// Mock data for demonstration
const mockQuestions = [
  {
    id: 1,
    title: "How to add certificates to Java?",
    body: "I need to add SSL certificates to my Java application. What's the correct process?",
    answers: [
      {
        id: 1,
        body: "Use the keytool command to import the certificate into your Java keystore:\n\n1. First, locate your Java keystore (typically in $JAVA_HOME/lib/security/cacerts)\n2. Run the command:\n   keytool -importcert -alias mycert -file certificate.crt -keystore cacerts -storepass changeit\n\nNote: The default keystore password is 'changeit'",
        upvotes: 45,
        downvotes: 2,
        author: "Java Security Expert"
      },
      {
        id: 2,
        body: "For programmatic approach:\n\n```java\nSystem.setProperty(\"javax.net.ssl.trustStore\", \"/path/to/keystore\");\nSystem.setProperty(\"javax.net.ssl.trustStorePassword\", \"password\");\n```\n\nAdd this before making any SSL connections.",
        upvotes: 32,
        downvotes: 1,
        author: "Senior Developer"
      },
      {
        id: 3,
        body: "If you're using Spring Boot, add these to application.properties:\n\nserver.ssl.key-store=classpath:keystore.jks\nserver.ssl.key-store-password=password\nserver.ssl.key-store-type=JKS\nserver.ssl.key-alias=tomcat",
        upvotes: 28,
        downvotes: 0,
        author: "Spring Expert"
      }
    ],
    upvotes: 120,
    downvotes: 0,
    author: "New Java Dev"
  },
  {
    id: 2,
    title: "How do I set up my development environment?",
    body: "I'm new to the team and need help setting up my local development environment. What are the steps?",
    answers: [
      {
        id: 4,
        body: "1. Install Node.js (v18 or higher)\n2. Clone the repository: git clone https://github.com/company/project\n3. Run npm install\n4. Copy .env.example to .env and update values\n5. Run npm run dev\n6. Install Docker for local services\n7. Run docker-compose up -d",
        upvotes: 25,
        downvotes: 1,
        author: "Alex Chen"
      },
      {
        id: 5,
        body: "For Windows users:\n1. Install WSL2\n2. Install Ubuntu from Microsoft Store\n3. Follow Linux setup guide\n4. Configure VS Code Remote WSL extension",
        upvotes: 18,
        downvotes: 0,
        author: "Windows Expert"
      }
    ],
    upvotes: 45,
    downvotes: 0,
    author: "Sarah Johnson"
  },
  {
    id: 3,
    title: "What's the process for deploying to production?",
    body: "Need to understand the deployment process for pushing changes to production.",
    answers: [
      {
        id: 6,
        body: "1. Create a PR to main branch\n2. Get 2 approvals from senior devs\n3. Ensure all tests pass (npm run test)\n4. Update changelog.md\n5. Merge PR\n6. CI/CD will:\n   - Run tests\n   - Build Docker image\n   - Deploy to staging\n   - Run E2E tests\n   - Deploy to production\n7. Monitor metrics for 1 hour",
        upvotes: 32,
        downvotes: 0,
        author: "Mike Wilson"
      },
      {
        id: 7,
        body: "Common gotchas to watch for:\n1. Always check ENV variables in staging\n2. Verify DB migrations work\n3. Check CDN cache settings\n4. Monitor error rates post-deploy",
        upvotes: 28,
        downvotes: 1,
        author: "DevOps Lead"
      }
    ],
    upvotes: 52,
    downvotes: 1,
    author: "David Lee"
  },
  {
    id: 4,
    title: "How to handle database migrations in production?",
    body: "What's the safest way to apply database migrations in production without downtime?",
    answers: [
      {
        id: 8,
        body: "Zero-downtime migration process:\n\n1. Always make backward-compatible changes\n2. Follow these steps:\n   - Add new column (nullable)\n   - Deploy code that writes to both old and new\n   - Migrate data\n   - Deploy code that reads from new\n   - Remove old column\n\nNever modify existing columns directly!",
        upvotes: 42,
        downvotes: 0,
        author: "Database Admin"
      },
      {
        id: 9,
        body: "Use tools like Flyway or Liquibase to manage migrations:\n\n```sql\n-- Example Flyway migration\nCREATE TABLE users_new AS SELECT * FROM users;\nALTER TABLE users_new ADD COLUMN email VARCHAR(255);\n-- Copy data\nDROP TABLE users;\nALTER TABLE users_new RENAME TO users;\n```",
        upvotes: 35,
        downvotes: 2,
        author: "Senior DBA"
      }
    ],
    upvotes: 88,
    downvotes: 1,
    author: "Backend Dev"
  },
  {
    id: 5,
    title: "Best practices for API error handling?",
    body: "What's the recommended way to handle and return API errors to clients?",
    answers: [
      {
        id: 10,
        body: "Standard error response format:\n\n```json\n{\n  \"error\": {\n    \"code\": \"VALIDATION_ERROR\",\n    \"message\": \"Invalid input\",\n    \"details\": [{\n      \"field\": \"email\",\n      \"message\": \"Must be valid email\"\n    }]\n  }\n}\n```\n\nUse appropriate HTTP status codes:\n- 400: Bad Request\n- 401: Unauthorized\n- 403: Forbidden\n- 404: Not Found\n- 422: Unprocessable Entity\n- 429: Too Many Requests\n- 500: Internal Server Error",
        upvotes: 56,
        downvotes: 1,
        author: "API Designer"
      },
      {
        id: 11,
        body: "Error handling middleware example:\n\n```typescript\napp.use((err, req, res, next) => {\n  if (err instanceof ValidationError) {\n    return res.status(400).json({\n      error: {\n        code: 'VALIDATION_ERROR',\n        message: err.message,\n        details: err.details\n      }\n    });\n  }\n  // Log error to monitoring service\n  logger.error(err);\n  res.status(500).json({\n    error: {\n      code: 'INTERNAL_ERROR',\n      message: 'An unexpected error occurred'\n    }\n  });\n});\n```",
        upvotes: 48,
        downvotes: 0,
        author: "Backend Lead"
      }
    ],
    upvotes: 95,
    downvotes: 2,
    author: "API Developer"
  }
];

export const QAInterface: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [questions, setQuestions] = useState(mockQuestions);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = questions.find(q => 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.body.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSelectedQuestion(found || null);
  };

  const handleVote = (questionId: number, answerId: number, isUpvote: boolean) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.map(a => {
            if (a.id === answerId) {
              return {
                ...a,
                upvotes: isUpvote ? a.upvotes + 1 : a.upvotes,
                downvotes: !isUpvote ? a.downvotes + 1 : a.downvotes
              };
            }
            return a;
          }).sort((a, b) => b.upvotes - a.upvotes) // Sort answers by upvotes
        };
      }
      return q;
    }));
    
    // Update selected question if it's currently displayed
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(questions.find(q => q.id === questionId));
    }
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !newAnswer.trim()) return;

    const newAnswerObj = {
      id: Date.now(),
      body: newAnswer,
      upvotes: 0,
      downvotes: 0,
      author: "Current User"
    };

    setQuestions(questions.map(q => {
      if (q.id === selectedQuestion.id) {
        return {
          ...q,
          answers: [...q.answers, newAnswerObj]
        };
      }
      return q;
    }));

    setNewAnswer('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search for 'java', 'deployment', 'database' or 'api'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-[#4A154B] text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Search
        </button>
      </form>

      {selectedQuestion ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedQuestion.title}</h2>
          <p className="text-gray-600 mb-4">{selectedQuestion.body}</p>
          <p className="text-sm text-gray-500 mb-6">Asked by {selectedQuestion.author}</p>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Answers
            </h3>

            {selectedQuestion.answers.map((answer: any) => (
              <div key={answer.id} className="border-l-4 border-green-500 pl-4 py-2">
                <pre className="text-gray-700 whitespace-pre-wrap font-sans">{answer.body}</pre>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Answered by {answer.author}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleVote(selectedQuestion.id, answer.id, true)}
                      className="flex items-center gap-1 text-gray-600 hover:text-green-600"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{answer.upvotes}</span>
                    </button>
                    <button
                      onClick={() => handleVote(selectedQuestion.id, answer.id, false)}
                      className="flex items-center gap-1 text-gray-600 hover:text-red-600"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>{answer.downvotes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <form onSubmit={handleSubmitAnswer} className="mt-6">
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Write your answer..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Answer
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-lg">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Search for a question to see answers and contribute</p>
        </div>
      )}
    </div>
  );
};