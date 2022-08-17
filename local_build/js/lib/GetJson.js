import timer from "./timer.js"
import localTextData from './scenario_data.json' assert { type: "json" }

/**
 * 乱数生成
 * @returns 乱数
 */
const rnd = () => {return Math.floor(Math.random() * 100)}

/**
 * 再帰で再実行した回数カウント
 */
let retryTime = 0

/**
 * DriveToWebからシナリオデータのJSONを取得
 * @param {string} url 
 * @returns 
 */
export default async function GetJson(url) {

    // 10回超えたらローカルのデータを渡す // これは最悪の場合
    if(retryTime > 10) return localTextData

    const random = rnd()

    const res = await fetch(url + '?id=' + random)
    
    if (res.status === 403) {
        console.log(`再取得 : ${url}`)
        retryTime++
        await timer(10 * retryTime) // 10ミリ秒 × 回数 で時間間隔を空ける
        return await GetJson (url) // 403エラーで失敗する時があるのでその時は再帰で再送信 // 基本2回目でいける
    }

    console.log(`Get JSON : ${url}`);
    return await res.json()

}