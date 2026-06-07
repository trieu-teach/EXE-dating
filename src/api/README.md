# SameMess API layer (frontend)

## Cấu hình

Tạo file `.env` từ `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MOCK_API=true
```

- `VITE_USE_MOCK_API=true`: dùng dữ liệu mock (phát triển UI).
- `VITE_USE_MOCK_API=false`: gọi backend thật; nếu lỗi mạng sẽ fallback mock (chỉ dev).

## Cấu trúc

- `config.js` — base URL và `API_ENDPOINTS`
- `http.js` — `request`, `get`, `post`, JWT từ `session.getAccessToken()`
- `services/*.service.js` — một service mỗi domain
- `mocks/` — dữ liệu demo

## Hook dùng trên mọi trang

```jsx
import { useAsync } from '../hooks/useAsync'
import { chatService } from '../api'
import AsyncContent from '../components/User/AsyncContent/AsyncContent'

const { data, loading, error, refetch } = useAsync(
  () => chatService.getMessages(conversationId),
  [conversationId],
)

return (
  <AsyncContent loading={loading} error={error} onRetry={refetch}>
    {/* UI với data */}
  </AsyncContent>
)
```

## Chat AI (backend contract)

`POST /api/chat/conversations/:id/ai-suggestions`

**Body:**

```json
{
  "messages": [
    { "id": "m2", "role": "partner", "content": "...", "createdAt": "..." }
  ]
}
```

**Response:**

```json
{
  "suggestions": [
    { "id": "s1", "text": "...", "tone": "curious" }
  ],
  "insight": "Gợi ý ngắn cho người dùng",
  "generatedAt": "2025-05-22T10:00:00Z"
}
```

Frontend: `chatService.getAiSuggestions(conversationId, messages, partnerName)`
