import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       handleLikeClick(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    }
    else if(e.target.dataset.replyTo){
        handleReplyBtnClick(e.target.dataset.replyTo)
    }
    else if(e.target.dataset.replyLike){
        handleReplyLikeClick(e.target.dataset.replyLike, e.target.dataset.tweetId)
    }
    else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    }
})
 
function handleLikeClick(tweetId){ 
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    render()
}

function handleRetweetClick(tweetId){
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    render() 
}

function handleReplyClick(replyId){
    const repliesDiv = document.getElementById(`replies-${replyId}`)
    repliesDiv.classList.toggle('hidden')
    
    // Add reply input if it doesn't exist
    if (!document.getElementById(`reply-input-${replyId}`)) {
        const replyInputHtml = `
            <div class="tweet-input-area reply-input">
                <img src="images/goldenpuppy.png" class="profile-pic">
                <textarea placeholder="Tweet your reply" id="reply-input-${replyId}"></textarea>
            </div>
            <button class="reply-btn" data-reply-to="${replyId}">Reply</button>
        `
        repliesDiv.insertAdjacentHTML('afterbegin', replyInputHtml)
    }
}

function handleReplyBtnClick(replyToId) {
    const replyInput = document.getElementById(`reply-input-${replyToId}`)
    const replyText = replyInput.value.trim()

    if (replyText) {
        const targetTweet = tweetsData.find(tweet => tweet.uuid === replyToId)
        if (targetTweet) {
            const newReply = {
                handle: `@GoldenMaple`,
                profilePic: `images/goldenpuppy.png`,
                tweetText: replyText,
                likes: 0,
                isLiked: false,
                uuid: uuidv4()
            }
            targetTweet.replies.unshift(newReply)
            
            // Clear the input
            replyInput.value = ''
            
            // Add the new reply to the UI without re-rendering
            const repliesDiv = document.getElementById(`replies-${replyToId}`)
            const newReplyHtml = `
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${newReply.profilePic}" class="profile-pic">
            <div>
                <p class="handle">${newReply.handle}</p>
                <p class="tweet-text">${newReply.tweetText}</p>
                <div class="tweet-details">
                    <span class="tweet-detail">
                        <i class="fa-solid fa-heart"
                        data-reply-like="${newReply.uuid}"
                        data-tweet-id="${replyToId}"
                        ></i>
                        ${newReply.likes}
                    </span>
                </div>
            </div>
        </div>
</div>
`
            // Insert the new reply after the reply input area
            const replyInputArea = document.querySelector(`.reply-input`)
            replyInputArea.insertAdjacentHTML('afterend', newReplyHtml)
            
            // Update the reply count in the tweet
            const replyCount = document.querySelector(`[data-reply="${replyToId}"]`).nextSibling
            replyCount.textContent = targetTweet.replies.length
        }
    }
}

function handleReplyLikeClick(replyId, tweetId) {
    const targetTweet = tweetsData.find(tweet => tweet.uuid === tweetId)
    if (targetTweet) {
        const targetReply = targetTweet.replies.find(reply => reply.uuid === replyId)
        if (targetReply) {
            if (targetReply.isLiked) {
                targetReply.likes--
            } else {
                targetReply.likes++
            }
            targetReply.isLiked = !targetReply.isLiked
            
            // Update only the reply's like count and icon
            const likeIcon = document.querySelector(`[data-reply-like="${replyId}"]`)
            const likeCount = likeIcon.nextSibling
            
            if (likeIcon) {
                likeIcon.classList.toggle('liked')
                likeCount.textContent = targetReply.likes
            }
        }
    }
}

function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        tweetsData.unshift({
            handle: `@GoldenMaple`,
            profilePic: `images/goldenpuppy.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })
    render()
    tweetInput.value = ''
    }

}

function getFeedHtml(){
    let feedHtml = ``
    
    tweetsData.forEach(function(tweet){
        
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }
        
        let repliesHtml = ''
        
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                const likeIconClass = reply.isLiked ? 'liked' : ''
                repliesHtml+=`
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
            <div>
                <p class="handle">${reply.handle}</p>
                <p class="tweet-text">${reply.tweetText}</p>
                <div class="tweet-details">
                    <span class="tweet-detail">
                        <i class="fa-solid fa-heart ${likeIconClass}"
                        data-reply-like="${reply.uuid}"
                        data-tweet-id="${tweet.uuid}"
                        ></i>
                        ${reply.likes}
                    </span>
                </div>
            </div>
        </div>
</div>
`
            })
        }
        
          
        feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
            </div>   
        </div>            
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
    </div>   
</div>
`
   })
   return feedHtml 
}

function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
}

render()

