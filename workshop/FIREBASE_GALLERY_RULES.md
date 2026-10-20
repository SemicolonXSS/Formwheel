# Creator Gallery Firebase Realtime Database 규칙 조각

Firebase Console → Realtime Database → 규칙에서 **기존 규칙을 지우지 말고** 아래 `workshopGallery` 노드만 기존 최상위 `rules` 객체에 병합하세요. 이 파일 자체는 GitHub에만 저장되며 Firebase에 자동 적용되지 않습니다.

게시 절차: Firebase Console에서 `workshopGallery/submissions/{uid}/{submissionId}` 항목을 검토하고, 안전한 작품만 `workshopGallery/published/{submissionId}` 아래로 복사한 후 `approved: true`를 추가합니다. 제출자의 개인 기록은 제거하지 않아도 됩니다. 승인 전 자동 공개되지 않습니다. 일반 브라우저에서 승인/삭제가 불가능하며 관리자 콘솔에서 수행합니다.

```json
{
  "workshopGallery": {
    ".read": false,
    ".write": false,
    "published": {
      ".read": true,
      ".write": false,
      ".indexOn": ["createdAt"]
    },
    "submissions": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        "$submissionId": {
          ".write": "auth != null && auth.uid === $uid && !data.exists() && newData.exists()",
          ".validate": "newData.hasChildren(['title','description','author','type','url','createdAt']) && newData.childrenCount === 6",
          "title": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 60" },
          "description": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 280" },
          "author": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 32" },
          "type": { ".validate": "newData.isString() && (newData.val() === 'Maze' || newData.val() === 'Music' || newData.val() === 'Form' || newData.val() === 'Check' || newData.val() === '기타')" },
          "url": { ".validate": "newData.isString() && newData.val().length <= 600 && newData.val().matches(/^https:\\/\\/[^\\s]+$/)" },
          "createdAt": { ".validate": "newData.isNumber() && newData.val() > 0" },
          "$other": { ".validate": false }
        }
      }
    }
  }
}
```

**주의:** 일반 클라이언트의 임의 공개를 금지하는 것이 핵심입니다. 기존 root의 `.write: true`나 상위 `.write` 허용 규칙은 자식 규칙으로 취소할 수 없으므로 공개 DB 규칙이 열려 있는 경우 먼저 상위 권한을 제한해야 합니다. Firebase Console의 Rules Playground에서 게스트/로그인/타인 UID 읽기·쓰기 검사를 반드시 수행하세요. 링크 유효성, 악성 콘텐츠 여부, 저작권, 개인정보 공개 여부를 승인자가 검토하세요. 제출 양은 인증 계정별 제한/앱 체크 등 추가 남용 방지 작업이 필요합니다.
