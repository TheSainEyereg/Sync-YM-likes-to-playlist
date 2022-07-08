### Usage

1. You should create `config.json` file in the root like this:
```json
{
	"YMAuth": {
		"uid": 123456789,
		"access_token": "ACCESSTOKEN"
	},
	"targetPlaylist": 1014
}
```
Get YM token in **network tab in DevTools (F12)** at: https://music-yandex-bot.ru/

2. Run `npm i`.
3. Copy all files from `ym-api fix/` to `node_modules/ym-api/dist/`.
3. Start script with `node index`
