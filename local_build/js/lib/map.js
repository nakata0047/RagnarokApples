import mapItemsJson from "./mapItems.json" assert { type: "json" }
// import TextData from './scenario_data.json' assert { type: "json" }
import GetJson from "./GetJson.js"
import MapTextData from './mapText.json' assert { type: "json" }
import ScenarioPlayer from './ScenarioPlayer.js'
import toDarking from "./toDarking.js"

let CreateMapCount = 0
let TextData
let TextAudio

/**
 * マップ作成
 * @param {object} gameState 
 */
export async function CreateMap(gameState) {

    /*
        データ取得
        ここのURLを.envで隠したい
        GetJson以外の方法（Electronのメインプロセス）でhttpリクエストでJSONファイルをダウンロードするやつも作るか要検討
    */
    TextData ??= await GetJson(window?.myAPI?.URLS?.SCENARIO_DATA_JSON) // .envから読み込んできたURL
    TextAudio ??= await GetJson(window?.myAPI?.URLS?.SCENARIO_AUDIO_DATA_JSON) // .envから読み込んできたURL

    const NowCreateMapCount = ++CreateMapCount

    // マップアイテムの生成
    gameState.eventState = 'map'
    const eleFragment = document.createDocumentFragment()
    // シナリオ格納
    const mapItems = mapItemsJson[gameState.nowPart]
    // console.log(gameState.nowPart);
    // console.log(mapItems);
    for (const itemId in mapItems) {
        if (Object.hasOwnProperty.call(mapItems, itemId)) {
            const item = mapItems[itemId]
            const itemEle = document.createElement('div')
            itemEle.id = itemId
            itemEle.className = 'map-touch'
            itemEle.dataset.place = item.place

            // イベント付与
            itemEle.addEventListener('click',(e) => {

                const float = document.getElementById('mapWrapper')
                float.classList.remove('none')
                const pname = document.getElementById('placeName')
                const placeName = e.target.dataset.place
                pname.innerHTML = placeName

                const partKey = item.partKey

                const yesBtn = document.getElementById('mapSelectYes')
                const noBtn = document.getElementById('mapSelectNo')

                /**
                 * 付与するYES/NO選択イベント
                 * @param {*} e event
                 */
                const selectEve = async (e) => {
                    float.classList.add('none')
                    e.target.removeEventListener('click',selectEve,false)//クリックされたボタンのイベントを削除
                    e.target === yesBtn ? noBtn : yesBtn .removeEventListener('click',selectEve,false)//クリックされなかったボタンのイベントを削除

                    if( e.target === yesBtn ) { // yesが押された

                        // 暗転
                        await toDarking( e => {
                            // シナリオ画面へ遷移
                            document.getElementById('textScreen').classList.remove('none')
                            document.getElementById('mapScreen').classList.add('none')

                            console.log(TextData[partKey]);//選択されたシナリオ
    
                            gameState.textEventId++;
                            gameState.nowPart = partKey
                            gameState.TextPlayer = new ScenarioPlayer(TextData[partKey], TextAudio[partKey], gameState)//プレイヤー生成

                        }, gameState)

                    }

                }

                yesBtn.addEventListener('click',selectEve,false)
                noBtn.addEventListener('click',selectEve,false)
            })

            // スタイル付与
            const styles = item.style
            for (const prop in styles) {
                if (Object.hasOwnProperty.call(styles, prop)) {
                    const val = styles[prop]
                    itemEle.style[prop] = val
                }
            }

            // フラグメントにappend
            eleFragment.appendChild(itemEle)
        }
    }
    // DOMにappend
    document.getElementById('mapItems').innerHTML = ''
    document.getElementById('mapItems').appendChild(eleFragment)

    const spb = document.querySelector('#speechBubble .textarea')
    const data = MapTextData[gameState.nowPart] 
    const msg = data ? data['mapMessageText'] : 'テキスト切れ'
    spb.textContent = msg

    const floatSpbTextList = data ? data['tipsMessage'] : 
        [
            'Tips:黒い四角の範囲が選択できます',
            'どこへ行こう？',
            '上の方かな？',
            '下でもあり',
        ]
    let floatSpbTextCount = 0
    // マップ②の画面下のテキスト処理
    const floatSpbText = document.querySelector('#FloatSpeechBubble .textarea')
    // console.log(floatSpbText);
    floatSpbText.innerHTML = floatSpbTextList[floatSpbTextCount]
    floatSpbText.addEventListener('click', (function() {
        return function f(e) {
            if (CreateMapCount !== NowCreateMapCount) {
                floatSpbText.removeEventListener('click', f)
            }

            // console.log(e.target.innerHTML);
            floatSpbTextCount++
            if (floatSpbTextCount >= floatSpbTextList.length) floatSpbTextCount = 0
            e.target.innerHTML = floatSpbTextList[floatSpbTextCount]
        }
    }()))

    const mapImg = document.getElementById('mapBackground')
    const imgSrc = data ? `images/background/${data['backgroundImage']}` : 'images/background/map.png'
    // console.log(imgSrc);
    mapImg.setAttribute('src', imgSrc)

    if( !mapItems ) alert("ゲーム終了")

}