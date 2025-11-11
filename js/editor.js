const { marked } = require('marked');
const { ipcRenderer } = require('electron');
let hljs; try { hljs = require('highlight.js'); } catch {}

// Emoji shortcode map - common emojis
const emojiMap = {
  // Smileys & Emotion
  ':)': '🙂', ':-)': '🙂', ':(': '🙁', ':-(': '🙁',
  ':D': '😃', ':-D': '😃', ':P': '😛', ':-P': '😛',
  ';)': '😉', ';-)': '😉', ':o': '😮', ':-o': '😮',
  ':joy:': '😂', ':rofl:': '🤣', ':smile:': '😄', ':smiley:': '😃',
  ':grin:': '😁', ':laughing:': '😆', ':sweat_smile:': '😅',
  ':blush:': '😊', ':innocent:': '😇', ':wink:': '😉',
  ':relieved:': '😌', ':heart_eyes:': '😍', ':kissing_heart:': '😘',
  ':yum:': '😋', ':stuck_out_tongue:': '😛', ':stuck_out_tongue_winking_eye:': '😜',
  ':neutral_face:': '😐', ':expressionless:': '😑', ':no_mouth:': '😶',
  ':smirk:': '😏', ':unamused:': '😒', ':face_with_rolling_eyes:': '🙄',
  ':grimacing:': '😬', ':lying_face:': '🤥', ':pensive:': '😔',
  ':confused:': '😕', ':slightly_frowning_face:': '🙁', ':frowning_face:': '☹️',
  ':persevere:': '😣', ':confounded:': '😖', ':tired_face:': '😫',
  ':weary:': '😩', ':triumph:': '😤', ':rage:': '😡', ':angry:': '😠',
  ':smiling_imp:': '😈', ':imp:': '👿', ':skull:': '💀',
  ':clown_face:': '🤡', ':poop:': '💩', ':ghost:': '👻',
  ':alien:': '👽', ':robot:': '🤖', ':jack_o_lantern:': '🎃',
  ':smiley_cat:': '😺', ':heart_eyes_cat:': '😻', ':scream_cat:': '🙀',
  ':crying_cat_face:': '😿', ':pouting_cat:': '😾',
  ':see_no_evil:': '🙈', ':hear_no_evil:': '🙉', ':speak_no_evil:': '🙊',
  ':kiss:': '💋', ':love_letter:': '💌', ':cupid:': '💘',
  ':gift_heart:': '💝', ':sparkling_heart:': '💖', ':heartpulse:': '💗',
  ':heartbeat:': '💓', ':revolving_hearts:': '💞', ':two_hearts:': '💕',
  ':heart:': '❤️', ':orange_heart:': '🧡', ':yellow_heart:': '💛',
  ':green_heart:': '💚', ':blue_heart:': '💙', ':purple_heart:': '💜',
  ':black_heart:': '🖤', ':white_heart:': '🤍', ':brown_heart:': '🤎',
  ':broken_heart:': '💔', ':heart_on_fire:': '❤️‍🔥',
  ':100:': '💯', ':anger:': '💢', ':boom:': '💥', ':collision:': '💥',
  ':dizzy:': '💫', ':sweat_drops:': '💦', ':dash:': '💨',
  ':hole:': '🕳️', ':speech_balloon:': '💬', ':thought_balloon:': '💭',
  ':zzz:': '💤',
  
  // People & Body
  ':wave:': '👋', ':raised_back_of_hand:': '🤚', ':raised_hand:': '✋',
  ':vulcan_salute:': '🖖', ':ok_hand:': '👌', ':pinched_fingers:': '🤌',
  ':pinching_hand:': '🤏', ':v:': '✌️', ':crossed_fingers:': '🤞',
  ':love_you_gesture:': '🤟', ':metal:': '🤘', ':call_me_hand:': '🤙',
  ':point_left:': '👈', ':point_right:': '👉', ':point_up_2:': '👆',
  ':point_down:': '👇', ':point_up:': '☝️', ':+1:': '👍', ':thumbsup:': '👍',
  ':-1:': '👎', ':thumbsdown:': '👎', ':fist:': '✊', ':facepunch:': '👊',
  ':left_facing_fist:': '🤛', ':right_facing_fist:': '🤜',
  ':clap:': '👏', ':raised_hands:': '🙌', ':open_hands:': '👐',
  ':palms_up_together:': '🤲', ':handshake:': '🤝', ':pray:': '🙏',
  ':writing_hand:': '✍️', ':nail_care:': '💅', ':selfie:': '🤳',
  ':muscle:': '💪', ':mechanical_arm:': '🦾', ':leg:': '🦵',
  ':foot:': '🦶', ':ear:': '👂', ':nose:': '👃', ':brain:': '🧠',
  ':tooth:': '🦷', ':bone:': '🦴', ':eyes:': '👀', ':eye:': '👁️',
  ':tongue:': '👅', ':lips:': '👄',
  
  // Animals & Nature
  ':dog:': '🐶', ':cat:': '🐱', ':mouse:': '🐭', ':hamster:': '🐹',
  ':rabbit:': '🐰', ':fox:': '🦊', ':bear:': '🐻', ':panda_face:': '🐼',
  ':koala:': '🐨', ':tiger:': '🐯', ':lion:': '🦁', ':cow:': '🐮',
  ':pig:': '🐷', ':frog:': '🐸', ':monkey_face:': '🐵', ':see_no_evil:': '🙈',
  ':chicken:': '🐔', ':penguin:': '🐧', ':bird:': '🐦', ':baby_chick:': '🐤',
  ':bee:': '🐝', ':bug:': '🐛', ':butterfly:': '🦋', ':snail:': '🐌',
  ':snake:': '🐍', ':turtle:': '🐢', ':fish:': '🐟', ':tropical_fish:': '🐠',
  ':dolphin:': '🐬', ':whale:': '🐳', ':octopus:': '🐙', ':shell:': '🐚',
  ':crab:': '🦀', ':lobster:': '🦞', ':shrimp:': '🦐',
  ':dragon:': '🐉', ':unicorn:': '🦄', ':horse:': '🐴',
  
  // Food & Drink
  ':apple:': '🍎', ':orange:': '🍊', ':lemon:': '🍋', ':banana:': '🍌',
  ':watermelon:': '🍉', ':grapes:': '🍇', ':strawberry:': '🍓',
  ':melon:': '🍈', ':cherries:': '🍒', ':peach:': '🍑', ':pear:': '🍐',
  ':pineapple:': '🍍', ':kiwi_fruit:': '🥝', ':avocado:': '🥑',
  ':tomato:': '🍅', ':eggplant:': '🍆', ':broccoli:': '🥦',
  ':carrot:': '🥕', ':corn:': '🌽', ':hot_pepper:': '🌶️',
  ':bread:': '🍞', ':croissant:': '🥐', ':baguette_bread:': '🥖',
  ':pizza:': '🍕', ':hamburger:': '🍔', ':fries:': '🍟',
  ':hot_dog:': '🌭', ':taco:': '🌮', ':burrito:': '🌯',
  ':coffee:': '☕', ':tea:': '🍵', ':sake:': '🍶', ':beer:': '🍺',
  ':wine_glass:': '🍷', ':cocktail:': '🍸', ':tropical_drink:': '🍹',
  ':cake:': '🍰', ':cupcake:': '🧁', ':cookie:': '🍪',
  ':chocolate_bar:': '🍫', ':candy:': '🍬', ':lollipop:': '🍭',
  ':doughnut:': '🍩', ':ice_cream:': '🍨',
  
  // Activities & Sports
  ':soccer:': '⚽', ':basketball:': '🏀', ':football:': '🏈',
  ':baseball:': '⚾', ':tennis:': '🎾', ':volleyball:': '🏐',
  ':8ball:': '🎱', ':ping_pong:': '🏓', ':badminton:': '🏸',
  ':goal_net:': '🥅', ':ice_hockey:': '🏒', ':golf:': '⛳',
  ':dart:': '🎯', ':trophy:': '🏆', ':medal:': '🏅',
  ':1st_place_medal:': '🥇', ':2nd_place_medal:': '🥈', ':3rd_place_medal:': '🥉',
  ':video_game:': '🎮', ':joystick:': '🕹️', ':game_die:': '🎲',
  ':chess_pawn:': '♟️', ':musical_note:': '🎵', ':notes:': '🎶',
  ':microphone:': '🎤', ':headphones:': '🎧', ':guitar:': '🎸',
  ':trumpet:': '🎺', ':violin:': '🎻', ':drum:': '🥁',
  
  // Travel & Places
  ':car:': '🚗', ':taxi:': '🚕', ':blue_car:': '🚙', ':bus:': '🚌',
  ':train:': '🚆', ':airplane:': '✈️', ':rocket:': '🚀',
  ':helicopter:': '🚁', ':bike:': '🚲', ':scooter:': '🛴',
  ':ship:': '🚢', ':anchor:': '⚓', ':sailboat:': '⛵',
  ':star:': '⭐', ':star2:': '🌟', ':sparkles:': '✨',
  ':sunny:': '☀️', ':cloud:': '☁️', ':partly_sunny:': '⛅',
  ':thunder_cloud_and_rain:': '⛈️', ':rain_cloud:': '🌧️',
  ':snow_cloud:': '🌨️', ':rainbow:': '🌈', ':umbrella:': '☂️',
  ':snowflake:': '❄️', ':fire:': '🔥', ':droplet:': '💧',
  ':ocean:': '🌊', ':earth_americas:': '🌎', ':earth_africa:': '🌍',
  ':earth_asia:': '🌏', ':globe_with_meridians:': '🌐',
  ':house:': '🏠', ':house_with_garden:': '🏡', ':office:': '🏢',
  ':hospital:': '🏥', ':bank:': '🏦', ':hotel:': '🏨',
  ':school:': '🏫', ':church:': '⛪', ':mountain:': '⛰️',
  ':camping:': '🏕️', ':beach_umbrella:': '🏖️', ':desert:': '🏜️',
  ':island:': '🏝️', ':national_park:': '🏞️',
  
  // Objects
  ':watch:': '⌚', ':phone:': '📱', ':calling:': '📲',
  ':computer:': '💻', ':keyboard:': '⌨️', ':desktop_computer:': '🖥️',
  ':printer:': '🖨️', ':mouse:': '🖱️', ':trackball:': '🖲️',
  ':camera:': '📷', ':camera_flash:': '📸', ':video_camera:': '📹',
  ':movie_camera:': '🎥', ':tv:': '📺', ':radio:': '📻',
  ':cd:': '💿', ':dvd:': '📀', ':bulb:': '💡',
  ':flashlight:': '🔦', ':candle:': '🕯️', ':fire_extinguisher:': '🧯',
  ':battery:': '🔋', ':electric_plug:': '🔌', ':mag:': '🔍',
  ':lock:': '🔒', ':unlock:': '🔓', ':key:': '🔑',
  ':hammer:': '🔨', ':wrench:': '🔧', ':scissors:': '✂️',
  ':link:': '🔗', ':chains:': '⛓️', ':syringe:': '💉',
  ':pill:': '💊', ':bookmark:': '🔖', ':toilet:': '🚽',
  ':shower:': '🚿', ':book:': '📖', ':notebook:': '📓',
  ':ledger:': '📒', ':closed_book:': '📕', ':green_book:': '📗',
  ':blue_book:': '📘', ':orange_book:': '📙', ':books:': '📚',
  ':memo:': '📝', ':pencil2:': '✏️', ':crayon:': '🖍️',
  ':paintbrush:': '🖌️', ':mag_right:': '🔎',
  ':briefcase:': '💼', ':file_folder:': '📁', ':open_file_folder:': '📂',
  ':card_index_dividers:': '🗂️', ':calendar:': '📆',
  ':chart_with_upwards_trend:': '📈', ':chart_with_downwards_trend:': '📉',
  ':bar_chart:': '📊', ':clipboard:': '📋', ':pushpin:': '📌',
  ':paperclip:': '📎', ':email:': '📧', ':envelope:': '✉️',
  ':inbox_tray:': '📥', ':outbox_tray:': '📤', ':package:': '📦',
  ':mailbox:': '📫', ':mailbox_closed:': '📪',
  
  // Symbols
  ':heart_exclamation:': '❣️', ':heavy_heart_exclamation:': '❣️',
  ':heavy_check_mark:': '✔️', ':check:': '✅', ':x:': '❌',
  ':heavy_multiplication_x:': '✖️', ':heavy_plus_sign:': '➕',
  ':heavy_minus_sign:': '➖', ':heavy_division_sign:': '➗',
  ':question:': '❓', ':grey_question:': '❔', ':grey_exclamation:': '❕',
  ':exclamation:': '❗', ':warning:': '⚠️', ':bangbang:': '‼️',
  ':interrobang:': '⁉️', ':arrow_right:': '➡️', ':arrow_left:': '⬅️',
  ':arrow_up:': '⬆️', ':arrow_down:': '⬇️', ':arrow_upper_right:': '↗️',
  ':arrow_lower_right:': '↘️', ':arrow_lower_left:': '↙️',
  ':arrow_upper_left:': '↖️', ':arrow_up_down:': '↕️',
  ':left_right_arrow:': '↔️', ':arrows_counterclockwise:': '🔄',
  ':arrow_right_hook:': '↪️', ':leftwards_arrow_with_hook:': '↩️',
  ':arrow_heading_up:': '⤴️', ':arrow_heading_down:': '⤵️',
  ':recycle:': '♻️', ':white_check_mark:': '✅', ':cool:': '🆒',
  ':new:': '🆕', ':free:': '🆓', ':zero:': '0️⃣', ':one:': '1️⃣',
  ':two:': '2️⃣', ':three:': '3️⃣', ':four:': '4️⃣',
  ':five:': '5️⃣', ':six:': '6️⃣', ':seven:': '7️⃣',
  ':eight:': '8️⃣', ':nine:': '9️⃣', ':keycap_ten:': '🔟',
  ':hash:': '#️⃣', ':asterisk:': '*️⃣',
  ':copyright:': '©️', ':registered:': '®️', ':tm:': '™️'
};

// Function to convert emoji shortcodes to actual emojis
function convertEmojis(text) {
  let result = text;
  // Sort by length (longest first) to avoid partial matches
  const sortedKeys = Object.keys(emojiMap).sort((a, b) => b.length - a.length);
  for (const shortcode of sortedKeys) {
    // Use regex with global flag to replace all occurrences
    const regex = new RegExp(shortcode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, emojiMap[shortcode]);
  }
  return result;
}

// Helper function to check if text is a URL
function isURL(text) {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    // Also match common URL patterns without protocol
    return /^(www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/.*)?$/.test(text);
  }
}

// Function to convert GitHub-style callouts/alerts
function convertGitHubCallouts(text) {
  // Match patterns like:
  // > [!NOTE]
  // > Content here
  // > More content
  
  const calloutRegex = /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$((?:\n>\s*.*)*)/gim;
  
  const calloutConfig = {
    'NOTE': { icon: 'ℹ️', color: '#0969da', bg: 'rgba(9, 105, 218, 0.1)', border: '#0969da' },
    'TIP': { icon: '💡', color: '#1f883d', bg: 'rgba(31, 136, 61, 0.1)', border: '#1f883d' },
    'IMPORTANT': { icon: '💜', color: '#8250df', bg: 'rgba(130, 80, 223, 0.1)', border: '#8250df' },
    'WARNING': { icon: '⚠️', color: '#bf8700', bg: 'rgba(191, 135, 0, 0.1)', border: '#bf8700' },
    'CAUTION': { icon: '🛑', color: '#cf222e', bg: 'rgba(207, 34, 46, 0.1)', border: '#cf222e' }
  };
  
  return text.replace(calloutRegex, (match, type, content) => {
    const config = calloutConfig[type.toUpperCase()];
    if (!config) return match;
    
    // Clean up the content: remove leading '>' and trim
    const cleanContent = content
      .split('\n')
      .map(line => line.replace(/^>\s*/, ''))
      .filter(line => line.trim())
      .join('\n');
    
    // Create a custom HTML block for the callout
    return `<div class="github-callout github-callout-${type.toLowerCase()}" style="border-left: 4px solid ${config.border}; background: ${config.bg}; padding: 12px 16px; margin: 16px 0; border-radius: 6px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
<span style="font-size: 20px;">${config.icon}</span>
<strong style="color: ${config.color}; font-weight: 600; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px;">${type}</strong>
</div>
<div style="color: var(--text-primary); line-height: 1.6;">${cleanContent}</div>
</div>`;
  });
}

// ==================== EMOJI PICKER ====================
const emojisByCategory = {
  all: Object.values(emojiMap),
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱'],
  gestures: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'],
  food: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧈', '🥓', '🥚', '🍳', '🧇', '🥞', '🧈', '🍞', '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🫖', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧃', '🧉', '🧊', '🥢', '🍽️', '🍴', '🥄', '🔪'],
  travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚁', '🛸', '🚀', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤸', '🤼', '🤾', '🤹', '🧘', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'],
  objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '💊', '💉', '🩸', '🩹', '🩺', '🌡️', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🧸', '🖼️', '🛍️', '🛒'],
  symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', '➿', '🌀', '♠️', '♣️', '♥️', '♦️', '🆗', '🆙', '🆒', '🆕', '🆓', '🔟']
};

let currentEmojiCategory = 'all';

function openEmojiPicker() {
  const overlay = document.getElementById('emoji-picker-overlay');
  const emojiGrid = document.getElementById('emoji-grid');
  const emojiSearch = document.getElementById('emoji-search');
  
  if (!overlay || !emojiGrid) return;
  
  overlay.style.display = 'flex';
  emojiSearch.value = '';
  currentEmojiCategory = 'all';
  renderEmojiGrid();
  
  // Focus search input
  setTimeout(() => emojiSearch.focus(), 100);
}

function closeEmojiPicker() {
  const overlay = document.getElementById('emoji-picker-overlay');
  if (overlay) overlay.style.display = 'none';
}

function renderEmojiGrid(emojis = null) {
  const emojiGrid = document.getElementById('emoji-grid');
  if (!emojiGrid) return;
  
  const emojisToShow = emojis || emojisByCategory[currentEmojiCategory] || emojisByCategory.all;
  
  emojiGrid.innerHTML = '';
  emojisToShow.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-item';
    btn.textContent = emoji;
    btn.title = emoji;
    btn.addEventListener('click', () => {
      insertEmoji(emoji);
      closeEmojiPicker();
    });
    emojiGrid.appendChild(btn);
  });
}

function insertEmoji(emoji) {
  if (!markdownInput) return;
  
  const start = markdownInput.selectionStart;
  const end = markdownInput.selectionEnd;
  const value = markdownInput.value;
  
  markdownInput.value = value.substring(0, start) + emoji + value.substring(end);
  markdownInput.selectionStart = markdownInput.selectionEnd = start + emoji.length;
  
  markdownInput.focus();
  hasUnsavedChanges = true;
  updatePreview();
}

// Configure marked options
marked.setOptions({
  breaks: true, // Treat single line breaks as <br>
  gfm: true,
  headerIds: true,
  mangle: false,
  pedantic: false,
  highlight: function(code, lang) {
    if (hljs) {
      try {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      } catch (e) { return code; }
    }
    return code;
  }
});

// Global variables
let currentFileId = localStorage.getItem('currentFileId');
let autoSaveTimer = null;
let currentFileData = null;
let hasUnsavedChanges = false;
let lastSavedContent = '';
let isEmptyFile = true;
let fileEverHadContent = false; // Track if file was ever saved with content
// Status bar elements
let statusWord;
let statusChar;
let statusRead;
let statusActiveHeading;
// Command palette elements
let cmdkOverlay; let cmdkInput; let cmdkList; let cmdkItems = []; let cmdkActiveIndex = -1;
// Outline & Find/Replace elements and state
let outlinePanel; let outlineContent; let outlineBtn; let outlineHideBtn;
let findPanel; let findInput; let replaceInput; let findPrevBtn; let findNextBtn; let replaceBtn; let replaceAllBtn; let findCloseBtn; let findCase; let findRegex; let findWord; let findCountEl;
let findMatches = []; let findIndex = -1;

// DOM Elements
let markdownInput;
let previewOutput;
let fileTitleInput;

// Initialize all event listeners
function initializeNavbar() {
  // Window controls
  const minimizeBtn = document.getElementById('minimize-btn');
  const maximizeBtn = document.getElementById('maximize-btn');
  const closeBtn = document.getElementById('close-btn');

  try {
    if (minimizeBtn) minimizeBtn.setAttribute('data-bind', 'true');
    if (maximizeBtn) maximizeBtn.setAttribute('data-bind', 'true');
    if (closeBtn) closeBtn.setAttribute('data-bind', 'true');
  } catch (e) { console.warn('Navbar attribute bind failed:', e); }

  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      ipcRenderer.send('minimize-window');
    });
  }

  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', () => {
      ipcRenderer.send('maximize-window');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      ipcRenderer.send('close-window');
    });
  }

  // (legacy menu-btn removed; settings handled via overflow or palette)

  // Home button
  const homeBtn = document.getElementById('home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', async () => {
      console.log('[Home Button] Clicked');
      console.log('[Home Button] currentFileId:', currentFileId);
      console.log('[Home Button] hasUnsavedChanges:', hasUnsavedChanges);
      console.log('[Home Button] fileEverHadContent:', fileEverHadContent);
      
      // Check if file is empty and untouched (never had content)
      const isUntouchedEmpty = isFileEmpty();
      console.log('[Home Button] isUntouchedEmpty:', isUntouchedEmpty);
      
      // Only delete if file is truly untouched (empty AND never had content)
      if (isUntouchedEmpty) {
        console.log('[Home Button] File is untouched and empty, deleting and navigating home');
        if (currentFileId) {
          try { 
            await ipcRenderer.invoke('delete-file', currentFileId);
            console.log('[Home Button] File deleted successfully');
          } catch (e) {
            console.error('[Home Button] Delete failed:', e);
          }
          try { 
            localStorage.removeItem('currentFileId');
          } catch (e) {
            console.error('[Home Button] localStorage removal failed:', e);
          }
        }
        ipcRenderer.send('load-page', 'home.html');
        return;
      }
      
      // If file has content OR was previously saved, handle unsaved changes
      if (hasUnsavedChanges) {
        console.log('[Home Button] Has unsaved changes, prompting user');
        const result = await window.dialog.confirmSave('You have unsaved changes. Do you want to save before leaving?');
        console.log('[Home Button] User chose:', result.action);
        
        if (result.action === 'save') {
          await autoSave();
          hasUnsavedChanges = false;
          ipcRenderer.send('load-page', 'home.html');
        } else if (result.action === 'dont-save') {
          hasUnsavedChanges = false;
          ipcRenderer.send('load-page', 'home.html');
        }
        // If cancelled, do nothing
      } else {
        // No unsaved changes, just navigate
        console.log('[Home Button] No unsaved changes, navigating home');
        ipcRenderer.send('load-page', 'home.html');
      }
    });
  } else {
    console.error('[Home Button] Element not found!');
  }

  // Export button
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      const result = await ipcRenderer.invoke('export-file', markdownInput.value, fileTitleInput.value);
      if (result.success) {
        dialog.alert('Export Success', `File exported successfully to:\n${result.path}`);
      } else if (!result.cancelled) {
        dialog.alert('Export Failed', `Export failed: ${result.error || 'Unknown error'}`);
      }
    });
  }

  // Add Image button
  const imageBtn = document.getElementById('image-btn');
  if (imageBtn) {
    imageBtn.addEventListener('click', async () => {
      if (!currentFileId) {
        await window.dialog.alert('No File', 'Please create or open a file first.');
        return;
      }
      
      const result = await ipcRenderer.invoke('add-image', currentFileId);
      if (result.success) {
        // Insert HTML img tag with resizable class for CSS control
        const imageName = result.fileName || 'image';
        const imageHtml = `<img src="${result.path}" alt="${imageName}" class="md-image" style="max-width:100%;height:auto;" />`;
        
        const start = markdownInput.selectionStart;
        const end = markdownInput.selectionEnd;
        const value = markdownInput.value;
        // Ensure image is treated as a block: add surrounding newlines for separation
        let before = value.substring(0, start);
        let after = value.substring(end);
        const needsNewlineBefore = before.length > 0 && !/\n$/.test(before);
        const needsNewlineAfter = after.length > 0 && !/^\n/.test(after);
        const insertText = `${needsNewlineBefore ? '\n' : ''}${imageHtml}${needsNewlineAfter ? '\n' : ''}`;
        markdownInput.value = before + insertText + after;
        const newPos = before.length + insertText.length;
        markdownInput.selectionStart = markdownInput.selectionEnd = newPos;
        
        // Trigger preview update
        updatePreview();
        hasUnsavedChanges = true;
        
        await window.dialog.alert('Image Added', `Image added successfully!\n\nHTML: ${imageHtml}`);
      } else if (!result.cancelled) {
        await window.dialog.alert('Error', `Failed to add image: ${result.error || 'Unknown error'}`);
      }
    });
  }

  // Emoji button - opens emoji picker
  const emojiBtn = document.getElementById('emoji-btn');
  if (emojiBtn) {
    emojiBtn.addEventListener('click', () => {
      openEmojiPicker();
    });
  }

  // Wiki button - opens markdown cheat sheet
  const wikiBtn = document.getElementById('wiki-btn');
  if (wikiBtn) {
    wikiBtn.addEventListener('click', () => {
      require('electron').shell.openExternal('https://www.markdownguide.org/cheat-sheet/');
    });
  }

  // Overflow (hamburger) menu handlers
  const overflowBtn = document.getElementById('overflow-btn');
  const overflowMenu = document.getElementById('overflow-menu');
  if (overflowBtn && overflowMenu) {
    overflowBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      overflowMenu.classList.toggle('show');
    });
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!overflowMenu.contains(e.target) && !overflowBtn.contains(e.target)) {
        overflowMenu.classList.remove('show');
      }
    });
    // Menu actions
    overflowMenu.addEventListener('click', async (e) => {
      const item = e.target.closest('.overflow-item');
      if (!item) return;
      const action = item.getAttribute('data-action');
      overflowMenu.classList.remove('show');
      switch (action) {
        case 'settings': {
          // Delete ephemeral empty file before leaving if untouched
          const isEmpty = isFileEmpty();
          console.log('[Settings Navigation] isFileEmpty:', isEmpty, 'currentFileId:', currentFileId);
          if (isEmpty && currentFileId) {
            console.log('[Settings Navigation] Deleting empty file before navigating to settings');
            try { await ipcRenderer.invoke('delete-file', currentFileId); } catch (e) {
              console.error('[Settings Navigation] Delete failed:', e);
            }
            try { localStorage.removeItem('currentFileId'); } catch {}
          }
          try { localStorage.setItem('returnTo', JSON.stringify({ page: 'editor', fileId: currentFileId })); } catch {}
          ipcRenderer.send('load-page', 'settings.html');
          break;
        }
        case 'export': {
          document.getElementById('export-btn')?.click();
          break;
        }
        case 'image': {
          document.getElementById('image-btn')?.click();
          break;
        }
        case 'outline': {
          toggleOutline();
          break;
        }
        case 'find': {
          toggleFind(true);
          break;
        }
      }
    });
  }

  // (Removed dropdown and download/reset; hamburger now navigates to Settings)
}

// Fallback event delegation for titlebar navigation (in case listeners fail to bind)
// Removed fallback listener referencing #menu-btn; home handled directly.

// Initialize editor elements
function initializeEditor() {
  markdownInput = document.getElementById('markdown-input');
  previewOutput = document.getElementById('preview-output');
  fileTitleInput = document.getElementById('file-title');
  statusWord = document.getElementById('status-word-count');
  statusChar = document.getElementById('status-char-count');
  statusRead = document.getElementById('status-reading-time');
  statusActiveHeading = document.getElementById('status-active-heading');
  cmdkOverlay = document.getElementById('cmdk-overlay');
  cmdkInput = document.getElementById('cmdk-input');
  cmdkList = document.getElementById('cmdk-list');
  // Outline & Find/Replace elements
  outlinePanel = document.getElementById('outline-panel');
  outlineContent = document.getElementById('outline-content');
  outlineBtn = document.getElementById('outline-btn');
  outlineHideBtn = document.getElementById('outline-hide');
  findPanel = document.getElementById('find-panel');
  // find button removed (trigger via palette / hamburger)
  findInput = document.getElementById('find-input');
  replaceInput = document.getElementById('replace-input');
  findPrevBtn = document.getElementById('find-prev');
  findNextBtn = document.getElementById('find-next');
  replaceBtn = document.getElementById('replace-btn');
  replaceAllBtn = document.getElementById('replace-all-btn');
  findCloseBtn = document.getElementById('find-close');
  findCase = document.getElementById('find-case');
  findRegex = document.getElementById('find-regex');
  findWord = document.getElementById('find-word');
  findCountEl = document.getElementById('find-count');
}

// Function to check if file is essentially empty AND untouched (never had content)
// This is used to determine if a file should be auto-deleted on navigation
function isFileEmpty() {
  // CRITICAL: If elements aren't available, default to FALSE (safer than TRUE)
  // This prevents accidental deletion of files
  if (!fileTitleInput || !markdownInput) {
    console.warn('[isFileEmpty] DOM elements not available, defaulting to false');
    return false;
  }
  const title = fileTitleInput.value.trim();
  const content = markdownInput.value.trim();
  // Only consider empty if BOTH title is untitled/empty AND content is empty
  const isUntitled = (title === '' || title === 'Untitled');
  const hasNoContent = content === '';
  
  // IMPORTANT: Only return true if file is empty AND never had content
  // If a file previously had content and user emptied it, DON'T auto-delete it
  const shouldDelete = isUntitled && hasNoContent && !fileEverHadContent;
  
  console.log('[isFileEmpty] title:', title, 'content length:', content.length, 
              'fileEverHadContent:', fileEverHadContent, 'shouldDelete:', shouldDelete);
  return shouldDelete;
}

// Main initialization function
function initializeApp() {
  initializeNavbar();
  initializeEditor();
  
  if (!markdownInput || !previewOutput || !fileTitleInput) {
    console.error('Required DOM elements not found');
    return;
  }
  // Apply persisted word wrap preference
  try { applyWordWrapFromSetting(); } catch {}
  
  // Update preview and trigger auto-save on input with debouncing
  let previewDebounceTimer = null;
  let draftTimer = null;
  markdownInput.addEventListener('input', () => {
    // Debounce preview updates for better performance
    if (previewDebounceTimer) {
      clearTimeout(previewDebounceTimer);
    }
    previewDebounceTimer = setTimeout(() => {
      try { updatePreview(); } catch (e) { console.warn('Preview update failed:', e); }
      try { updateStatusBar(); } catch (e) { console.warn('Status bar update failed:', e); }
    }, 150); // 150ms debounce
  
    // Check if content has changed
    if (markdownInput.value !== lastSavedContent) {
      hasUnsavedChanges = true;
    }

    // Auto-save every 60 seconds (1 minute)
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
  
    autoSaveTimer = setTimeout(autoSave, 60000); // 60 seconds
    // Frequent draft save for recovery
    if (draftTimer) clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, 5000);
  });

  // Auto-link URLs when pasted
  markdownInput.addEventListener('paste', (e) => {
    const text = e.clipboardData.getData('text');
    // Check if pasted text is a URL
    if (isURL(text)) {
      e.preventDefault();
      const markdownLink = `[${text}](${text})`;
      const start = markdownInput.selectionStart;
      const end = markdownInput.selectionEnd;
      const value = markdownInput.value;
      markdownInput.value = value.substring(0, start) + markdownLink + value.substring(end);
      markdownInput.selectionStart = markdownInput.selectionEnd = start + markdownLink.length;
      hasUnsavedChanges = true;
      updatePreview();
    }
  });

  // Save title when changed
  fileTitleInput.addEventListener('blur', async () => {
    if (!currentFileId || !currentFileData) return;
  
    currentFileData.title = fileTitleInput.value || 'Untitled';
    await ipcRenderer.invoke('save-file', currentFileData);
    ipcRenderer.send('rpc-set-editing', currentFileData.title);
  });

  // Clear placeholder on focus for easier editing
  fileTitleInput.addEventListener('focus', (e) => {
    if (e.target.value === 'Untitled') {
      e.target.select();
    }
  });

  // Handle tab key in textarea
  markdownInput.addEventListener('keydown', (e) => {
    // Auto-link URLs when space or enter is pressed after typing a URL
    if (e.key === ' ' || e.key === 'Enter') {
      const cursorPos = markdownInput.selectionStart;
      const value = markdownInput.value;
      const textBeforeCursor = value.substring(0, cursorPos);
      const words = textBeforeCursor.split(/\s+/);
      const lastWord = words[words.length - 1];
      
      if (lastWord && isURL(lastWord) && !lastWord.match(/^\[.*\]\(.*\)$/)) {
        e.preventDefault();
        // Replace the URL with markdown link format
        const beforeURL = value.substring(0, cursorPos - lastWord.length);
        const afterCursor = value.substring(cursorPos);
        const markdownLink = `[${lastWord}](${lastWord})`;
        markdownInput.value = beforeURL + markdownLink + (e.key === ' ' ? ' ' : '\n') + afterCursor;
        markdownInput.selectionStart = markdownInput.selectionEnd = beforeURL.length + markdownLink.length + (e.key === ' ' ? 1 : 1);
        hasUnsavedChanges = true;
        updatePreview();
        return;
      }
    }
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = markdownInput.selectionStart;
      const end = markdownInput.selectionEnd;
      const value = markdownInput.value;
    
      // Insert tab character
      markdownInput.value = value.substring(0, start) + '  ' + value.substring(end);
    
      // Move cursor
      markdownInput.selectionStart = markdownInput.selectionEnd = start + 2;
    
      // Update preview
      updatePreview();
    }
    
    // Auto-continue lists on Enter
    if (e.key === 'Enter') {
      const cursorPos = markdownInput.selectionStart;
      const value = markdownInput.value;
      const lineStart = value.lastIndexOf('\n', cursorPos - 1) + 1;
      const currentLine = value.substring(lineStart, cursorPos);
      
      // Match list patterns: "- ", "* ", "1. ", "- [ ] ", "- [x] "
      const unorderedMatch = currentLine.match(/^(\s*)([-*])\s+(.*)$/);
      const orderedMatch = currentLine.match(/^(\s*)(\d+)\.\s+(.*)$/);
      const taskMatch = currentLine.match(/^(\s*)([-*])\s+\[([ xX])\]\s+(.*)$/);
      
      let newPrefix = null;
      
      if (taskMatch) {
        const [, indent, marker, , text] = taskMatch;
        if (text.trim() === '') {
          // Empty task item: remove it and don't continue
          e.preventDefault();
          const before = value.substring(0, lineStart);
          const after = value.substring(cursorPos);
          // Ensure exactly one blank line after previous list item (two newlines total)
          let insert = '';
          if (before.length > 0 && !/\n\n$/.test(before)) insert = '\n';
          markdownInput.value = before + insert + after;
          const newPos = before.length + insert.length;
          markdownInput.selectionStart = markdownInput.selectionEnd = newPos;
          updatePreview();
          return;
        }
        newPrefix = `${indent}${marker} [ ] `;
      } else if (unorderedMatch) {
        const [, indent, marker, text] = unorderedMatch;
        if (text.trim() === '') {
          // Empty list item: remove it and don't continue
          e.preventDefault();
          const before = value.substring(0, lineStart);
          const after = value.substring(cursorPos);
          let insert = '';
            if (before.length > 0 && !/\n\n$/.test(before)) insert = '\n';
          markdownInput.value = before + insert + after;
          const newPos = before.length + insert.length;
          markdownInput.selectionStart = markdownInput.selectionEnd = newPos;
          updatePreview();
          return;
        }
        newPrefix = `${indent}${marker} `;
      } else if (orderedMatch) {
        const [, indent, num, text] = orderedMatch;
        if (text.trim() === '') {
          // Empty list item: remove it and don't continue
          e.preventDefault();
          const before = value.substring(0, lineStart);
          const after = value.substring(cursorPos);
          let insert = '';
          if (before.length > 0 && !/\n\n$/.test(before)) insert = '\n';
          markdownInput.value = before + insert + after;
          const newPos = before.length + insert.length;
          markdownInput.selectionStart = markdownInput.selectionEnd = newPos;
          updatePreview();
          return;
        }
        const nextNum = parseInt(num, 10) + 1;
        newPrefix = `${indent}${nextNum}. `;
      }
      
      if (newPrefix) {
        e.preventDefault();
        const newText = '\n' + newPrefix;
        markdownInput.value = value.substring(0, cursorPos) + newText + value.substring(cursorPos);
        markdownInput.selectionStart = markdownInput.selectionEnd = cursorPos + newText.length;
        updatePreview();
      }
    }
  });

  // Resizable divider functionality
  const divider = document.getElementById('divider');
  const editorPane = document.getElementById('editor-pane');
  const previewPane = document.getElementById('preview-pane');
  const editorMain = document.querySelector('.editor-main');

  let isDragging = false;

  divider.addEventListener('mousedown', (e) => {
    isDragging = true;
    divider.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const containerRect = editorMain.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
  
    // Calculate percentage (between 20% and 80%)
    let percentage = (mouseX / containerWidth) * 100;
    percentage = Math.max(20, Math.min(80, percentage));
  
    editorPane.style.flex = `0 0 ${percentage}%`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      divider.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });

  // Synchronize scrolling
  let isEditorScrolling = false;
  let isPreviewScrolling = false;

  markdownInput.addEventListener('scroll', () => {
    if (!isPreviewScrolling) {
      isEditorScrolling = true;
      const scrollPercentage = markdownInput.scrollTop / (markdownInput.scrollHeight - markdownInput.clientHeight);
      previewOutput.scrollTop = scrollPercentage * (previewOutput.scrollHeight - previewOutput.clientHeight);
      setTimeout(() => isEditorScrolling = false, 100);
    }
  });

  previewOutput.addEventListener('scroll', () => {
    if (!isEditorScrolling) {
      isPreviewScrolling = true;
      const scrollPercentage = previewOutput.scrollTop / (previewOutput.scrollHeight - previewOutput.clientHeight);
      markdownInput.scrollTop = scrollPercentage * (markdownInput.scrollHeight - markdownInput.clientHeight);
      setTimeout(() => isPreviewScrolling = false, 100);
    }
  });

  // Warn before closing window if there are unsaved changes
  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
      e.returnValue = true;
    }
  });
  
  // Initialize clock display
  updateClock();
  updateDigitalClock();
  // Initialize status bar once
  updateStatusBar();
  setupCommandPalette();
  setupOutline();
  setupFindReplace();
  setupSmartPaste();
  setupFormattingToolbar();
  
  // Load the current file
  loadFile();
}

// Load current file
async function loadFile() {
  if (!currentFileId) {
    console.error('No file ID found');
    return;
  }

  currentFileData = await ipcRenderer.invoke('load-file', currentFileId);
  
  if (currentFileData) {
    fileTitleInput.value = currentFileData.title || 'Untitled';
    markdownInput.value = currentFileData.content || '';
    lastSavedContent = currentFileData.content || '';
    
    // Track if this file has ever had content (for smart deletion)
    fileEverHadContent = (currentFileData.content && currentFileData.content.trim().length > 0);
    console.log('[loadFile] fileEverHadContent:', fileEverHadContent, 'content length:', (currentFileData.content || '').length);
    
    updatePreview();
    // Update RPC presence with file title
    ipcRenderer.send('rpc-set-editing', fileTitleInput.value || 'Untitled');
    // Draft recovery check
    try {
      const draft = await ipcRenderer.invoke('load-draft', currentFileId, currentFileData.updatedAt);
      if (draft && draft.success && draft.exists && draft.newer && typeof draft.content === 'string' && draft.content !== markdownInput.value) {
        const restore = await window.dialog.confirm('Recover Unsaved Changes', 'A newer unsaved draft was found for this file. Restore it?');
        if (restore.action === 'ok') {
          markdownInput.value = draft.content;
          updatePreview();
          hasUnsavedChanges = true;
        }
      }
    } catch (e) { console.warn('Draft load failed:', e); }
  }
}

// Convert markdown to HTML and update preview
function updatePreview() {
  if (!markdownInput || !previewOutput) return;
  try {
    let md = markdownInput.value || '';
    // Convert GitHub callouts BEFORE markdown parsing (so they don't get treated as regular blockquotes)
    md = convertGitHubCallouts(md);
    // Convert emoji shortcodes before rendering markdown
    md = convertEmojis(md);
    const html = marked.parse(md);
    previewOutput.innerHTML = html;
    // Observe headings for active heading indicator
    observePreviewHeadings();
    // Rebuild outline when preview updates
    buildOutline();

    // Enable task list toggling in preview: click checkbox to toggle markdown [ ]/[x]
    previewOutput.addEventListener('click', onPreviewClickToggleTasks);
  } catch (err) {
    console.error('Error updating preview:', err);
  }
}

function onPreviewClickToggleTasks(e) {
  const target = e.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.type !== 'checkbox') return;
  // Find closest LI text
  let li = target.closest('li');
  if (!li) return;
  const labelText = (li.textContent || '').trim();
  if (!markdownInput) return;
  const lines = markdownInput.value.split(/\r?\n/);
  const idx = lines.findIndex(l => /^\s*[-*] \[( |x|X)\] /.test(l) && l.replace(/^\s*[-*] \[( |x|X)\] /,'').trim() === labelText);
  if (idx >= 0) {
    const isChecked = /\[(x|X)\]/.test(lines[idx]);
    lines[idx] = lines[idx].replace(/\[( |x|X)\]/, isChecked ? '[ ]' : '[x]');
    markdownInput.value = lines.join('\n');
    hasUnsavedChanges = true;
    updatePreview();
  }
}

function updateStatusBar() {
  if (!markdownInput || !statusWord || !statusChar || !statusRead) return;
  const text = markdownInput.value || '';
  const words = (text.match(/\b\w+\b/g) || []).length;
  const chars = text.length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  statusWord.textContent = `${words} words`;
  statusChar.textContent = `${chars} chars`;
  statusRead.textContent = `${minutes} min read`;
}

let headingObserver;
function observePreviewHeadings() {
  if (!previewOutput) return;
  const headings = previewOutput.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headingObserver) headingObserver.disconnect();
  if (!headings.length) {
    if (statusActiveHeading) statusActiveHeading.textContent = '';
    return;
  }
  headingObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    const target = visible.length ? visible[0].target : null;
    if (target && statusActiveHeading) {
      statusActiveHeading.textContent = target.textContent.trim();
    }
  }, { root: previewOutput, threshold: [0.1, 0.5, 1.0] });
  headings.forEach(h => headingObserver.observe(h));
}

// ==================== OUTLINE PANEL ====================
function setupOutline() {
  if (outlineBtn) outlineBtn.addEventListener('click', () => toggleOutline());
  if (outlineHideBtn) outlineHideBtn.addEventListener('click', () => toggleOutline(false));
}

function toggleOutline(force) {
  if (!outlinePanel) return;
  const willShow = typeof force === 'boolean' ? force : outlinePanel.classList.contains('hidden');
  outlinePanel.classList.toggle('hidden', !willShow);
}

function buildOutline() {
  if (!outlineContent || !previewOutput) return;
  const headings = Array.from(previewOutput.querySelectorAll('h1,h2,h3,h4,h5,h6'));
  outlineContent.innerHTML = '';
  if (!headings.length) return;
  headings.forEach((h, idx) => {
    const level = parseInt(h.tagName.substring(1), 10);
    if (!h.id) h.id = `heading-${idx}-${Date.now()}`;
    const item = document.createElement('div');
    item.className = `outline-item lvl-${level}`;
    const icon = document.createElement('i'); icon.className = 'fas fa-heading';
    const text = document.createElement('div'); text.className = 'outline-text'; text.textContent = h.textContent.trim();
    item.appendChild(icon); item.appendChild(text);
    item.addEventListener('click', () => {
      previewOutput.scrollTo({ top: Math.max(0, h.offsetTop - 8), behavior: 'smooth' });
    });
    outlineContent.appendChild(item);
  });
  if (statusActiveHeading) {
    const activeText = statusActiveHeading.textContent || '';
    Array.from(outlineContent.children).forEach(el => {
      const t = el.querySelector('.outline-text');
      el.classList.toggle('active', t && t.textContent === activeText);
    });
  }
}

// ==================== FORMATTING TOOLBAR ====================
function surroundSelection(before, after = before) {
  if (!markdownInput) return;
  const start = markdownInput.selectionStart;
  const end = markdownInput.selectionEnd;
  const value = markdownInput.value;
  const selected = value.slice(start, end);
  markdownInput.value = value.slice(0, start) + before + selected + after + value.slice(end);
  const cursor = start + before.length + selected.length + after.length;
  markdownInput.selectionStart = markdownInput.selectionEnd = cursor;
  updatePreview();
  hasUnsavedChanges = true;
}

function insertBlock(lines) {
  if (!markdownInput) return;
  const start = markdownInput.selectionStart;
  const value = markdownInput.value;
  const prefix = value.slice(0, start);
  const suffix = value.slice(start);
  const block = lines.join('\n') + '\n';
  markdownInput.value = prefix + block + suffix;
  markdownInput.selectionStart = markdownInput.selectionEnd = prefix.length + block.length;
  updatePreview();
  hasUnsavedChanges = true;
}

// Transform selected lines with a callback (returns new line)
function transformSelectedLines(mapper, opts = {}) {
  if (!markdownInput) return;
  const { skipEmpty = true } = opts;
  const value = markdownInput.value;
  const selStart = markdownInput.selectionStart;
  const selEnd = markdownInput.selectionEnd;
  const lineStart = value.lastIndexOf('\n', Math.max(0, selStart - 1)) + 1;
  const lineEndIdx = value.indexOf('\n', selEnd);
  const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
  const before = value.slice(0, lineStart);
  const selectionBlock = value.slice(lineStart, lineEnd);
  const after = value.slice(lineEnd);
  const lines = selectionBlock.split('\n');
  let counter = 0;
  const newLines = lines.map((line) => {
    if (skipEmpty && line.trim() === '') return line; // keep empty lines unchanged
    counter += 1;
    return mapper(line, counter);
  });
  const newBlock = newLines.join('\n');
  markdownInput.value = before + newBlock + after;
  // Reselect transformed block
  markdownInput.selectionStart = lineStart;
  markdownInput.selectionEnd = lineStart + newBlock.length;
  updatePreview();
  hasUnsavedChanges = true;
}

function applyHeading(level) {
  if (!markdownInput) return;
  const hashes = '#'.repeat(Math.max(1, Math.min(6, level)));
  const selStart = markdownInput.selectionStart;
  const selEnd = markdownInput.selectionEnd;
  
  // If no selection (or collapsed selection), insert new heading line
  if (selStart === selEnd) {
    insertBlock([`${hashes} Heading ${level}`]);
    return;
  }
  
  // Otherwise transform selected lines
  transformSelectedLines((line) => {
    // Strip existing heading marks if any (up to 3 leading spaces allowed by CommonMark)
    const stripped = line.replace(/^\s{0,3}(#{1,6}\s+)?/, '');
    if (stripped.trim() === '') return line; // don't add heading to empty line
    return `${hashes} ${stripped}`;
  });
}

// Toggle word wrap on the editor textarea and persist preference
function applyWordWrapFromSetting() {
  if (!markdownInput) return;
  let enabled = true;
  try {
    const v = localStorage.getItem('wordWrapEnabled');
    if (v !== null) enabled = v === 'true';
  } catch {}
  if (enabled) {
    // Enable soft wrap
    markdownInput.setAttribute('wrap', 'soft');
    markdownInput.style.whiteSpace = 'pre-wrap';
    markdownInput.style.overflowX = 'hidden';
  } else {
    // Disable wrap (horizontal scroll)
    markdownInput.setAttribute('wrap', 'off');
    markdownInput.style.whiteSpace = 'pre';
    markdownInput.style.overflowX = 'auto';
  }
}

function toggleWordWrap() {
  if (!markdownInput) return;
  let enabled = true;
  try {
    const v = localStorage.getItem('wordWrapEnabled');
    if (v !== null) enabled = v === 'true';
  } catch {}
  try { localStorage.setItem('wordWrapEnabled', (!enabled).toString()); } catch {}
  applyWordWrapFromSetting();
}

// Insert current timestamp at cursor or around selection
function insertTimestamp() {
  if (!markdownInput) return;
  const now = new Date();
  // ISO-like but local-friendly: YYYY-MM-DD HH:mm
  const pad = (n) => n.toString().padStart(2, '0');
  const ts = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  surroundSelection(ts, '');
}

// Convert selected lines to task list items (- [ ] ) preserving indentation
function convertSelectionToTaskList() {
  transformSelectedLines((line) => {
    if (line.trim() === '') return line;
    // Already a task item? keep as is
    if (/^\s*[-*]\s+\[(?: |x|X)\]\s+/.test(line)) return line;
    // Capture indent and strip existing list/numbering
    const task = line
      .replace(/^(\s*)[-*]\s+/, '$1')
      .replace(/^(\s*)\d+\.\s+/, '$1')
      .replace(/^\s{0,3}(#{1,6})\s+/, '') // strip heading if mistakenly applied
    ;
    const m = line.match(/^(\s*)/);
    const indent = m ? m[1] : '';
    const content = task.trim();
    return `${indent}- [ ] ${content}`;
  });
}

// Toggle checkbox state on task list items in selection
function toggleTaskCheckboxOnSelection() {
  transformSelectedLines((line) => {
    const unchecked = line.match(/^(\s*[-*]\s+)\[ \](\s+.*)$/);
    if (unchecked) {
      return `${unchecked[1]}[x]${unchecked[2]}`;
    }
    const checked = line.match(/^(\s*[-*]\s+)\[[xX]\](\s+.*)$/);
    if (checked) {
      return `${checked[1]}[ ]${checked[2]}`;
    }
    return line; // non-task lines unchanged
  }, { skipEmpty: true });
}

function toggleLinePrefix(pattern, replacement) {
  if (!markdownInput) return;
  const start = markdownInput.selectionStart;
  const end = markdownInput.selectionEnd;
  const value = markdownInput.value;
  const before = value.slice(0, start);
  const selection = value.slice(start, end);
  const after = value.slice(end);
  const lines = selection.split(/\n/);
  const transformed = lines.map(l => {
    if (pattern.test(l)) return l.replace(pattern, replacement ? '' : '');
    return (replacement || '') + l;
  }).join('\n');
  markdownInput.value = before + transformed + after;
  markdownInput.selectionStart = start;
  markdownInput.selectionEnd = start + transformed.length;
  updatePreview();
  hasUnsavedChanges = true;
}

function setupFormattingToolbar() {
  const map = {
    'bold-btn': () => surroundSelection('**', '**'),
    'italic-btn': () => surroundSelection('*', '*'),
    'strike-btn': () => surroundSelection('~~', '~~'),
    'code-btn': () => surroundSelection('`', '`'),
    'codeblock-btn': () => insertBlock(['```', '```']),
    'h1-btn': () => applyHeading(1),
    'h2-btn': () => applyHeading(2),
    'h3-btn': () => applyHeading(3),
    'ul-btn': () => insertBlock(['- Item 1', '- Item 2', '- Item 3']),
    'ol-btn': () => insertBlock(['1. First', '2. Second', '3. Third']),
    'task-btn': () => insertBlock(['- [ ] Task 1', '- [ ] Task 2']),
    'quote-btn': () => insertBlock(['> Blockquote']),
    'hr-btn': () => insertBlock(['---']),
    'link-btn': () => surroundSelection('[', '](https://example.com)'),
    'table-btn': () => insertBlock(['| Col1 | Col2 | Col3 |', '| --- | --- | --- |', '| Val1 | Val2 | Val3 |'])
  };
  Object.entries(map).forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  });
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key.toLowerCase() === 'b') { e.preventDefault(); map['bold-btn']?.(); }
    else if (ctrl && e.key.toLowerCase() === 'i') { e.preventDefault(); map['italic-btn']?.(); }
    else if (ctrl && e.key.toLowerCase() === 'k') { e.preventDefault(); map['link-btn']?.(); }
    else if (ctrl && e.shiftKey && e.key.toLowerCase() === 'c') { e.preventDefault(); map['codeblock-btn']?.(); }
  });
}

// ==================== FIND / REPLACE ====================
function setupFindReplace() {
  if (!findPanel) return;
  document.addEventListener('keydown', (e) => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key.toLowerCase() === 'f') { e.preventDefault(); toggleFind(true); }
    else if (ctrl && e.key.toLowerCase() === 'h') { e.preventDefault(); toggleFind(true); if (replaceInput) replaceInput.focus(); }
    else if (e.key === 'Escape' && findPanel.classList.contains('show')) { e.preventDefault(); toggleFind(false); }
    else if (e.key === 'F3') { e.preventDefault(); selectFind(1); }
    else if (e.shiftKey && e.key === 'F3') { e.preventDefault(); selectFind(-1); }
  });
  if (findCloseBtn) findCloseBtn.addEventListener('click', () => toggleFind(false));
  if (findInput) findInput.addEventListener('input', () => computeFindMatches());
  if (findCase) findCase.addEventListener('change', () => computeFindMatches());
  if (findRegex) findRegex.addEventListener('change', () => computeFindMatches());
  if (findWord) findWord.addEventListener('change', () => computeFindMatches());
  if (findNextBtn) findNextBtn.addEventListener('click', () => selectFind(1));
  if (findPrevBtn) findPrevBtn.addEventListener('click', () => selectFind(-1));
  if (replaceBtn) replaceBtn.addEventListener('click', () => replaceCurrent());
  if (replaceAllBtn) replaceAllBtn.addEventListener('click', () => replaceAll());
}

function toggleFind(force) {
  if (!findPanel) return;
  const show = typeof force === 'boolean' ? force : !findPanel.classList.contains('show');
  findPanel.classList.toggle('show', show);
  if (show) { setTimeout(() => findInput && findInput.focus(), 10); computeFindMatches(); }
  else { findMatches = []; findIndex = -1; if (findCountEl) findCountEl.textContent = ''; }
}

function computeFindMatches() {
  if (!findInput || !markdownInput) return;
  const query = findInput.value || '';
  findMatches = []; findIndex = -1;
  if (!query) { if (findCountEl) findCountEl.textContent = ''; return; }
  const content = markdownInput.value;
  let flags = (findCase && findCase.checked) ? 'g' : 'gi';
  let pattern;
  if (findRegex && findRegex.checked) { try { pattern = new RegExp(query, flags); } catch { pattern = null; } }
  else {
    const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    pattern = new RegExp((findWord && findWord.checked) ? `\\b${esc}\\b` : esc, flags);
  }
  if (!pattern) return;
  let m; while ((m = pattern.exec(content)) !== null) {
    findMatches.push({ start: m.index, end: m.index + m[0].length });
    if (m.index === pattern.lastIndex) pattern.lastIndex++;
  }
  if (findCountEl) findCountEl.textContent = findMatches.length ? `1/${findMatches.length}` : '0/0';
  if (findMatches.length) { findIndex = 0; applyFindSelection(); }
}

function selectFind(delta) {
  if (!findMatches.length) return;
  findIndex = (findIndex + delta + findMatches.length) % findMatches.length;
  applyFindSelection();
}

function applyFindSelection() {
  const m = findMatches[findIndex];
  if (!m) return;
  markdownInput.focus();
  markdownInput.selectionStart = m.start;
  markdownInput.selectionEnd = m.end;
  markdownInput.scrollTop = markdownInput.scrollHeight * (m.start / Math.max(1, markdownInput.value.length));
  if (findCountEl) findCountEl.textContent = `${findIndex + 1}/${findMatches.length}`;
}

function replaceCurrent() {
  if (!findMatches.length) return;
  const m = findMatches[findIndex];
  const replacement = replaceInput ? replaceInput.value : '';
  const value = markdownInput.value;
  markdownInput.value = value.slice(0, m.start) + replacement + value.slice(m.end);
  hasUnsavedChanges = true;
  updatePreview();
  computeFindMatches();
}

function replaceAll() {
  if (!findMatches.length) return;
  const replacement = replaceInput ? replaceInput.value : '';
  const query = findInput ? (findInput.value || '') : '';
  if (!query) return;
  const content = markdownInput.value;
  let flags = (findCase && findCase.checked) ? 'g' : 'gi';
  let pattern;
  if (findRegex && findRegex.checked) { try { pattern = new RegExp(query, flags); } catch { return; } }
  else { const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); pattern = new RegExp((findWord && findWord.checked) ? `\\b${esc}\\b` : esc, flags); }
  markdownInput.value = content.replace(pattern, replacement);
  hasUnsavedChanges = true;
  updatePreview();
  computeFindMatches();
}

// ==================== SMART PASTE ====================
function setupSmartPaste() {
  if (!markdownInput) return;
  markdownInput.addEventListener('paste', async (e) => {
    try {
      if (!currentFileId) return;
      const text = e.clipboardData?.getData('text/plain') || '';
      const url = text.trim();
      if (/^https?:\/\//i.test(url) && /(\.(png|jpe?g|gif|webp|svg)(\?|#|$))/.test(url)) {
        e.preventDefault();
        const res = await ipcRenderer.invoke('download-image', { url, fileId: currentFileId });
        if (res && res.success) {
          const imageHtml = `<img src="${res.path}" alt="${res.fileName || 'image'}" class="md-image" style="max-width:100%;height:auto;" />`;
          const start = markdownInput.selectionStart;
          const end = markdownInput.selectionEnd;
          const value = markdownInput.value;
          // Surround with newlines to ensure block separation
          let before = value.substring(0, start);
          let after = value.substring(end);
          const needsNewlineBefore = before.length > 0 && !/\n$/.test(before);
          const needsNewlineAfter = after.length > 0 && !/^\n/.test(after);
          const insertText = `${needsNewlineBefore ? '\n' : ''}${imageHtml}${needsNewlineAfter ? '\n' : ''}`;
          markdownInput.value = before + insertText + after;
          const newPos = before.length + insertText.length;
          markdownInput.selectionStart = markdownInput.selectionEnd = newPos;
          updatePreview();
          hasUnsavedChanges = true;
          return;
        }
      }
    } catch (err) {
      console.warn('Smart paste failed:', err);
    }
  });
}

// ==================== COMMAND PALETTE ====================
function setupCommandPalette() {
  if (!cmdkOverlay || !cmdkInput || !cmdkList) return;
  const commands = buildCommands();
  cmdkItems = commands;
  renderCommandList(commands);

  // Global shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      togglePalette(true);
    } else if (e.key === 'Escape' && cmdkOverlay.classList.contains('show')) {
      togglePalette(false);
    }
  });

  cmdkInput.addEventListener('input', () => {
    const q = cmdkInput.value.trim().toLowerCase();
    const filtered = cmdkItems.filter(c => c.title.toLowerCase().includes(q) || (c.keywords && c.keywords.some(k => k.includes(q))));
    renderCommandList(filtered);
  });

  cmdkInput.addEventListener('keydown', (e) => {
    const items = Array.from(cmdkList.querySelectorAll('.cmdk-item'));
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      cmdkActiveIndex = (cmdkActiveIndex + 1) % items.length;
      updateActiveItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      cmdkActiveIndex = (cmdkActiveIndex - 1 + items.length) % items.length;
      updateActiveItem(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (cmdkActiveIndex >= 0 && cmdkActiveIndex < items.length) {
        items[cmdkActiveIndex].click();
      }
    }
  });
}

function buildCommands() {
  return [
    { id: 'new-file', title: 'New File', sub: 'Create a blank document', action: async () => createNewDocumentFromPalette(), keywords: ['create','blank'] },
    { id: 'save', title: 'Save Now', sub: 'Manual save current file', action: async () => autoSave(), keywords: ['write','disk'] },
    { id: 'toggle-theme', title: 'Cycle Theme', sub: 'Switch to next theme', action: () => cycleTheme(), keywords: ['appearance','style','theme'] },
    { id: 'toggle-wrap', title: 'Toggle Word Wrap', sub: 'Enable/disable soft wrapping', action: () => toggleWordWrap(), keywords: ['wrap','word','lines'] },
    { id: 'insert-timestamp', title: 'Insert Timestamp', sub: 'Insert current date/time', action: () => insertTimestamp(), keywords: ['date','time','now'] },
    { id: 'to-task-list', title: 'Convert to Task List', sub: 'Turn selected lines into tasks', action: () => convertSelectionToTaskList(), keywords: ['tasks','checkbox','list'] },
    { id: 'toggle-task', title: 'Toggle Task Checkbox', sub: 'Toggle [ ] / [x] on tasks', action: () => toggleTaskCheckboxOnSelection(), keywords: ['tasks','checkbox','done'] },
    { id: 'open-settings', title: 'Open Settings', sub: 'Navigate to settings', action: () => navigateToSettingsSafely(), keywords: ['preferences','config'] },
    { id: 'add-image', title: 'Add Image', sub: 'Insert and cache image', action: () => document.getElementById('image-btn')?.click(), keywords: ['media','picture','asset'] },
    { id: 'find-replace', title: 'Find / Replace', sub: 'Open find & replace panel', action: () => toggleFind(true), keywords: ['search','replace','find'] },
    { id: 'toggle-outline', title: 'Toggle Outline', sub: 'Show/hide outline panel', action: () => toggleOutline(), keywords: ['outline','headings','navigation'] },
    { id: 'export-file', title: 'Export File', sub: 'Export current document', action: () => document.getElementById('export-btn')?.click(), keywords: ['download','docx','pdf','html'] }
  ];
}

function renderCommandList(list) {
  cmdkList.innerHTML = '';
  if (!list.length) {
    cmdkList.innerHTML = '<div class="cmdk-item"><span class="cmdk-title">No matches</span></div>';
    cmdkActiveIndex = -1;
    return;
  }
  list.forEach((c, i) => {
    const el = document.createElement('div');
    el.className = 'cmdk-item';
    el.innerHTML = `<div class="cmdk-title">${c.title}</div><div class="cmdk-sub">${c.sub}</div>`;
    el.addEventListener('click', () => {
      try { c.action(); } catch (e) { console.warn('Command failed:', c.id, e); }
      togglePalette(false);
    });
    cmdkList.appendChild(el);
  });
  cmdkActiveIndex = 0;
  updateActiveItem(Array.from(cmdkList.querySelectorAll('.cmdk-item')));
}

function updateActiveItem(items) {
  items.forEach((it, idx) => {
    if (idx === cmdkActiveIndex) it.classList.add('active'); else it.classList.remove('active');
  });
  const active = items[cmdkActiveIndex];
  if (active) {
    const rect = active.getBoundingClientRect();
    const listRect = cmdkList.getBoundingClientRect();
    if (rect.top < listRect.top) active.scrollIntoView({ block: 'nearest' });
    if (rect.bottom > listRect.bottom) active.scrollIntoView({ block: 'nearest' });
  }
}

function togglePalette(show) {
  if (!cmdkOverlay) return;
  if (show) {
    cmdkOverlay.classList.add('show');
    cmdkInput.value = '';
    renderCommandList(cmdkItems);
    setTimeout(() => cmdkInput.focus(), 10);
  } else {
    cmdkOverlay.classList.remove('show');
    cmdkActiveIndex = -1;
  }
}

// Settings navigation with deletion of untouched empty file
function navigateToSettingsSafely() {
  (async () => {
    const isEmpty = isFileEmpty();
    console.log('[navigateToSettingsSafely] isFileEmpty:', isEmpty, 'currentFileId:', currentFileId);
    if (isEmpty && currentFileId) {
      console.log('[navigateToSettingsSafely] Deleting empty file');
      try { await ipcRenderer.invoke('delete-file', currentFileId); } catch (e) {
        console.error('[navigateToSettingsSafely] Delete failed:', e);
      }
      try { localStorage.removeItem('currentFileId'); } catch {}
    }
    try { localStorage.setItem('returnTo', JSON.stringify({ page: 'editor', fileId: currentFileId })); } catch {}
    ipcRenderer.send('load-page', 'settings.html');
  })();
}

// Simple theme cycler placeholder
function cycleTheme() {
  try {
    const themes = ['dark','light','flowify','deep-ocean','sunset','cyberpunk'];
    // Prefer settings state if present
    (async () => {
      let next = 'dark';
      try {
        const settings = await ipcRenderer.invoke('load-settings');
        const themeLink = document.querySelector('link[data-theme]');
        let current = (settings && settings.theme) ? settings.theme : null;
        if (!current && themeLink) {
          const href = themeLink.getAttribute('href') || '';
          const match = href.match(/themes\/([^./]+)\.css/i);
          if (match) current = match[1];
        }
        if (!current) current = localStorage.getItem('theme') || 'dark';
        const idx = themes.indexOf(current);
        next = themes[(idx + 1) % themes.length];
        const newSettings = { ...(settings || {}), theme: next };
        await ipcRenderer.invoke('save-settings', newSettings);
        try { localStorage.setItem('theme', next); } catch {}
        if (themeLink) themeLink.setAttribute('href', `../themes/${next}.css`);
      } catch {}
      document.body.setAttribute('data-theme', next);
    })();
  } catch {}
}

// Removed cycleLanguage (feature deemed unnecessary)

async function createNewDocumentFromPalette() {
  const isEmpty = isFileEmpty();
  console.log('[createNewDocumentFromPalette] hasUnsavedChanges:', hasUnsavedChanges, 'isFileEmpty:', isEmpty);
  
  if (hasUnsavedChanges && !isEmpty) {
    const result = await window.dialog.confirmSave('You have unsaved changes. Save before creating a new file?');
    console.log('[createNewDocumentFromPalette] User chose:', result.action);
    if (result.action === 'save') {
      await autoSave();
    } else if (result.action === 'cancel') {
      return; // Abort creating new file
    }
  }
  try {
    const fileData = await ipcRenderer.invoke('create-new-file');
    console.log('[createNewDocumentFromPalette] New file created:', fileData);
    if (fileData && fileData.id) {
      localStorage.setItem('currentFileId', fileData.id);
      ipcRenderer.send('load-page', 'editor.html');
    }
  } catch (e) {
    console.error('Failed to create new file from palette:', e);
  }
}

function toggleGitPanelFromPalette() {
  const gitContent = document.getElementById('git-content');
  const gitToggleBtn = document.getElementById('git-toggle');
  if (!gitContent || !gitToggleBtn) return;
  const icon = gitToggleBtn.querySelector('i');
  const willCollapse = !gitContent.classList.contains('collapsed');
  gitContent.classList.toggle('collapsed', willCollapse);
  gitToggleBtn.classList.toggle('collapsed', willCollapse);
  if (icon) {
    icon.className = willCollapse ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  }
  // Persist state
  (async () => {
    try {
      const settings = await ipcRenderer.invoke('load-settings');
      const newSettings = { ...(settings || {}), gitPanelCollapsed: willCollapse };
      await ipcRenderer.invoke('save-settings', newSettings);
    } catch (e) { console.warn('Could not persist git panel toggle from palette:', e); }
  })();
}

// Auto-save current document content and title
async function autoSave() {
  if (!currentFileId) {
    console.warn('[autoSave] No currentFileId, aborting save');
    return;
  }
  
  console.log('[autoSave] Starting save for fileId:', currentFileId);
  
  const autosaveIndicator = document.getElementById('autosave-indicator');
  const autosaveText = autosaveIndicator?.querySelector('.autosave-text');
  const autosaveIcon = autosaveIndicator?.querySelector('i');
  
  try {
    // Show saving state
    if (autosaveIndicator) {
      autosaveIndicator.classList.remove('saved');
      autosaveIndicator.classList.add('saving', 'show');
      if (autosaveText) autosaveText.textContent = 'Saving...';
      if (autosaveIcon) {
        autosaveIcon.className = 'fas fa-circle-notch fa-spin';
      }
    }
    
    const title = (fileTitleInput && fileTitleInput.value) ? fileTitleInput.value : 'Untitled';
    const content = (markdownInput && markdownInput.value) ? markdownInput.value : '';
    
    console.log('[autoSave] Saving title:', title, 'content length:', content.length);
    
    // Track if file has ever had content (for smart deletion logic)
    if (content.trim().length > 0) {
      fileEverHadContent = true;
      console.log('[autoSave] File now has content, marking fileEverHadContent = true');
    }
    
    // Save both title and content
    await ipcRenderer.invoke('rename-file', currentFileId, title);
    console.log('[autoSave] Title saved successfully');
    
    await ipcRenderer.invoke('auto-save', currentFileId, content);
    console.log('[autoSave] Content saved successfully');
    
    lastSavedContent = content;
    hasUnsavedChanges = false;
    
    // Clear any draft after successful save
    try { 
      await ipcRenderer.invoke('delete-draft', currentFileId);
      console.log('[autoSave] Draft deleted successfully');
    } catch (e) {
      console.warn('[autoSave] Draft deletion failed:', e);
    }
    
    // Show saved state
    if (autosaveIndicator) {
      autosaveIndicator.classList.remove('saving');
      autosaveIndicator.classList.add('saved');
      if (autosaveText) autosaveText.textContent = 'Saved';
      if (autosaveIcon) {
        autosaveIcon.className = 'fas fa-check-circle';
      }
      
      // Hide after 3 seconds
      setTimeout(() => {
        autosaveIndicator.classList.remove('show');
      }, 3000);
    }
    
    console.log('[autoSave] Save completed successfully');
  } catch (err) {
    console.error('[autoSave] Save failed:', err);
    
    // Show error state
    if (autosaveIndicator) {
      autosaveIndicator.classList.remove('saving', 'saved');
      if (autosaveText) autosaveText.textContent = 'Save failed';
      if (autosaveIcon) {
        autosaveIcon.className = 'fas fa-exclamation-circle';
        autosaveIcon.style.color = '#f48771';
      }
      
      // Hide after 3 seconds
      setTimeout(() => {
        autosaveIndicator.classList.remove('show');
      }, 3000);
    }
  }
}

// Helper to save draft to main process
async function saveDraft() {
  try {
    if (!currentFileId || !markdownInput) return;
    await ipcRenderer.invoke('save-draft', currentFileId, markdownInput.value || '');
  } catch (e) {
    // non-fatal
  }
}

// ==================== TIME WIDGET ====================
let timeMode = 'clock'; // clock, timer, countdown
let timerInterval = null;
let timerSeconds = 0;
let countdownInterval = null;
let countdownSeconds = 0;
let countdownInitialSeconds = 0;

const timeWidget = document.getElementById('time-widget');
const timeDisplay = document.getElementById('time-display');
const timeModal = document.getElementById('time-modal');

// Toggle time modal
timeWidget.addEventListener('click', (e) => {
  e.stopPropagation();
  timeModal.classList.toggle('show');
  
  // Sync UI with current mode when opening modal
  if (timeModal.classList.contains('show')) {
    syncTimeModeUI();
  }
});

// Function to sync UI with current time mode
function syncTimeModeUI() {
  // Update active button
  document.querySelectorAll('.time-mode-btn').forEach(btn => {
    if (btn.getAttribute('data-mode') === timeMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Show/hide sections
  document.getElementById('clock-section').style.display = timeMode === 'clock' ? 'block' : 'none';
  document.getElementById('timer-section').style.display = timeMode === 'timer' ? 'block' : 'none';
  document.getElementById('countdown-section').style.display = timeMode === 'countdown' ? 'block' : 'none';
  
  // Update digital clock if in clock mode
  if (timeMode === 'clock') {
    updateDigitalClock();
  }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  if (!timeModal.contains(e.target) && !timeWidget.contains(e.target)) {
    timeModal.classList.remove('show');
  }
});

// Time mode selector
document.querySelectorAll('.time-mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.time-mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const mode = btn.getAttribute('data-mode');
    timeMode = mode;
    
    // Show/hide sections
    document.getElementById('clock-section').style.display = mode === 'clock' ? 'block' : 'none';
    document.getElementById('timer-section').style.display = mode === 'timer' ? 'block' : 'none';
    document.getElementById('countdown-section').style.display = mode === 'countdown' ? 'block' : 'none';
    
    // Only update displays if there's no active timer/countdown running
    if (mode === 'clock') {
      // Only update widget clock if no timer/countdown is running
      if (!timerInterval && !countdownInterval) {
        updateClock();
      }
      updateDigitalClock();
    } else if (mode === 'timer') {
      if (!timerInterval) timerSeconds = 0;
      updateTimerDisplay();
    } else if (mode === 'countdown') {
      if (!countdownInterval) {
        countdownSeconds = countdownInitialSeconds;
        updateCountdownDisplay();
      }
    }
  });
});

// Clock function
function updateClock() {
  if (timeMode === 'clock') {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeDisplay.textContent = `${hours}:${minutes}`;
  }
}

// Digital clock function for modal
function updateDigitalClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const digitalTime = document.getElementById('digital-time');
  const digitalDate = document.getElementById('digital-date');
  
  if (digitalTime) {
    digitalTime.textContent = `${hours}:${minutes}:${seconds}`;
  }
  
  if (digitalDate) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    digitalDate.textContent = `${dayName}, ${monthName} ${date}, ${year}`;
  }
}

// Timer functions
function updateTimerDisplay() {
  const hours = Math.floor(timerSeconds / 3600);
  const minutes = Math.floor((timerSeconds % 3600) / 60);
  const seconds = timerSeconds % 60;
  timeDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.getElementById('timer-start').addEventListener('click', function() {
  if (timerInterval) {
    // Pause
    clearInterval(timerInterval);
    timerInterval = null;
    this.textContent = (window.i18n ? i18n.t('start') : 'Start');
    this.classList.add('start');
  } else {
    // Start
    timerInterval = setInterval(() => {
      timerSeconds++;
      updateTimerDisplay();
    }, 1000);
    this.textContent = (window.i18n ? i18n.t('pause') : 'Pause');
    this.classList.remove('start');
  }
});

document.getElementById('timer-reset').addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = 0;
  updateTimerDisplay();
  document.getElementById('timer-start').textContent = (window.i18n ? i18n.t('start') : 'Start');
  document.getElementById('timer-start').classList.add('start');
});

// Countdown functions
function updateCountdownDisplay() {
  const hours = Math.floor(countdownSeconds / 3600);
  const minutes = Math.floor((countdownSeconds % 3600) / 60);
  const seconds = countdownSeconds % 60;
  timeDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.getElementById('countdown-start').addEventListener('click', function() {
  if (countdownInterval) {
    // Pause
    clearInterval(countdownInterval);
    countdownInterval = null;
    this.textContent = (window.i18n ? i18n.t('start') : 'Start');
    this.classList.add('start');
  } else {
    // Start - get initial time if not set
    if (countdownSeconds === 0 || countdownSeconds === countdownInitialSeconds) {
      const hours = parseInt(document.getElementById('countdown-hours').value) || 0;
      const minutes = parseInt(document.getElementById('countdown-minutes').value) || 0;
      const seconds = parseInt(document.getElementById('countdown-seconds').value) || 0;
      countdownInitialSeconds = hours * 3600 + minutes * 60 + seconds;
      countdownSeconds = countdownInitialSeconds;
    }
    
    if (countdownSeconds > 0) {
      countdownInterval = setInterval(() => {
        countdownSeconds--;
        updateCountdownDisplay();
        
        if (countdownSeconds <= 0) {
          clearInterval(countdownInterval);
          countdownInterval = null;
          document.getElementById('countdown-start').textContent = (window.i18n ? i18n.t('start') : 'Start');
          document.getElementById('countdown-start').classList.add('start');
          // Play alarm sound and show notification
          playAlarmSound();
          new Notification((window.i18n ? i18n.t('countdown_done_title') : 'Countdown Finished!'), { 
            body: (window.i18n ? i18n.t('countdown_done_body') : 'Your countdown has reached zero.'),
            icon: '../assets/icon.ico'
          });
        }
      }, 1000);
      this.textContent = (window.i18n ? i18n.t('pause') : 'Pause');
      this.classList.remove('start');
    }
  }
});

document.getElementById('countdown-reset').addEventListener('click', () => {
  clearInterval(countdownInterval);
  countdownInterval = null;
  const hours = parseInt(document.getElementById('countdown-hours').value) || 0;
  const minutes = parseInt(document.getElementById('countdown-minutes').value) || 0;
  const seconds = parseInt(document.getElementById('countdown-seconds').value) || 0;
  countdownInitialSeconds = hours * 3600 + minutes * 60 + seconds;
  countdownSeconds = countdownInitialSeconds;
  updateCountdownDisplay();
  document.getElementById('countdown-start').textContent = (window.i18n ? i18n.t('start') : 'Start');
  document.getElementById('countdown-start').classList.add('start');
});

// Update clock every second
setInterval(() => {
  if (timeMode === 'clock') {
    // Only update widget clock if no timer/countdown is running
    if (!timerInterval && !countdownInterval) {
      updateClock();
    }
    updateDigitalClock();
  }
}, 1000);

// Alarm sound function
function playAlarmSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Play two beeps
  const playBeep = (startTime) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.2);
  };
  
  const now = audioContext.currentTime;
  playBeep(now);           // First beep
  playBeep(now + 0.3);     // Second beep
}

// Handle close window request
ipcRenderer.on('request-close', async () => {
  if (hasUnsavedChanges) {
    const result = await window.dialog.show({
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Do you want to save before closing?',
      buttons: [
        { text: 'Save and Close', value: 'save', className: 'dialog-btn-primary' },
        { text: 'Close Without Saving', value: 'close', className: 'dialog-btn-danger' },
        { text: 'Cancel', value: 'cancel', className: 'dialog-btn-secondary' }
      ]
    });
    
    if (result.action === 'save') {
      await autoSave();
      ipcRenderer.send('confirm-close');
    } else if (result.action === 'close') {
      ipcRenderer.send('confirm-close');
    }
    // If 'cancel', do nothing
  } else {
    ipcRenderer.send('confirm-close');
  }
});

// ==================== EMOJI PICKER INITIALIZATION ====================
function initEmojiPicker() {
  const emojiOverlay = document.getElementById('emoji-picker-overlay');
  const emojiClose = document.getElementById('emoji-close');
  const emojiSearch = document.getElementById('emoji-search');
  const emojiCategories = document.querySelectorAll('.emoji-category');
  
  // Close button
  if (emojiClose) {
    emojiClose.addEventListener('click', closeEmojiPicker);
  }
  
  // Close on overlay click (outside modal)
  if (emojiOverlay) {
    emojiOverlay.addEventListener('click', (e) => {
      if (e.target === emojiOverlay) {
        closeEmojiPicker();
      }
    });
  }
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && emojiOverlay && emojiOverlay.style.display === 'flex') {
      closeEmojiPicker();
    }
  });
  
  // Category buttons
  emojiCategories.forEach(btn => {
    btn.addEventListener('click', () => {
      emojiCategories.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentEmojiCategory = btn.getAttribute('data-category');
      renderEmojiGrid();
    });
  });
  
  // Search functionality
  if (emojiSearch) {
    emojiSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderEmojiGrid();
        return;
      }
      
      // Search through all emojis and emoji names
      const allEmojis = emojisByCategory.all;
      const filtered = allEmojis.filter(emoji => {
        // Find the emoji shortcode
        const shortcode = Object.keys(emojiMap).find(key => emojiMap[key] === emoji);
        return shortcode && shortcode.toLowerCase().includes(query);
      });
      
      renderEmojiGrid(filtered);
    });
  }
}

// Git Integration
let currentRepoUrl = '';
let connectedFiles = [];
let gitEnabled = false;

// Check if Git integration is enabled in settings
async function initGitIntegration() {
  try {
    const settings = await ipcRenderer.invoke('load-settings');
    gitEnabled = settings && settings.gitEnabled ? true : false;
    const gitPanel = document.getElementById('git-panel');
    const gitContent = document.getElementById('git-content');
    const gitToggleBtn = document.getElementById('git-toggle');
    if (gitPanel) gitPanel.style.display = gitEnabled ? 'block' : 'none';
    // Apply persisted collapse state if enabled
    if (gitEnabled && gitContent && gitToggleBtn) {
      const collapsed = settings && settings.gitPanelCollapsed ? true : false;
      if (collapsed) {
        gitContent.classList.add('collapsed');
        gitToggleBtn.classList.add('collapsed');
      } else {
        gitContent.classList.remove('collapsed');
        gitToggleBtn.classList.remove('collapsed');
      }
    }
  } catch (e) {
    console.error('Failed to load Git settings:', e);
  }
}

// Toggle Git Panel
const gitToggle = document.getElementById('git-toggle');
const gitContent = document.getElementById('git-content');
const gitHeader = document.querySelector('.git-header');

if (gitHeader && gitToggle && gitContent) {
  gitHeader.addEventListener('click', async () => {
    const icon = gitToggle.querySelector('i');
    const nowCollapsed = !gitContent.classList.contains('collapsed');
    gitContent.classList.toggle('collapsed', nowCollapsed);
    gitToggle.classList.toggle('collapsed', nowCollapsed);
    if (icon) icon.className = nowCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    // Persist state
    try {
      const settings = await ipcRenderer.invoke('load-settings');
      const newSettings = { ...(settings || {}), gitPanelCollapsed: nowCollapsed };
      await ipcRenderer.invoke('save-settings', newSettings);
    } catch (err) {
      console.error('Failed to persist git panel collapse state:', err);
    }
  });
}

// Connect to Git Repository
const gitConnectBtn = document.getElementById('git-connect-btn');
const gitRepoUrl = document.getElementById('git-repo-url');
const gitFileSection = document.getElementById('git-file-section');
const gitRepoSection = document.getElementById('git-repo-section');
const gitConnectedRepo = document.getElementById('git-connected-repo');
const gitDisconnectBtn = document.getElementById('git-disconnect-btn');

if (gitConnectBtn && gitRepoUrl) {
  gitConnectBtn.addEventListener('click', async () => {
    const repoUrl = gitRepoUrl.value.trim();
    if (!repoUrl) {
      await window.dialog.alert('Missing URL', 'Please enter a repository URL');
      return;
    }

    gitConnectBtn.disabled = true;
    gitConnectBtn.textContent = 'Connecting...';
    
    const result = await ipcRenderer.invoke('git-connect', repoUrl);
    
    if (result.success) {
      currentRepoUrl = repoUrl;
      connectedFiles = result.files || [];
      
      // Hide repo section, show file section
      if (gitRepoSection) gitRepoSection.style.display = 'none';
      if (gitFileSection) gitFileSection.style.display = 'flex';
      if (gitConnectedRepo) {
        const shortUrl = repoUrl.replace('https://github.com/', '').replace('.git', '');
        gitConnectedRepo.textContent = shortUrl;
      }
      
      await window.dialog.alert('Connected', result.message);
    } else {
      await window.dialog.alert('Connection Failed', `Error: ${result.error}`);
    }
    
    gitConnectBtn.disabled = false;
    gitConnectBtn.textContent = 'Connect';
  });
}

// Disconnect from repository
if (gitDisconnectBtn) {
  gitDisconnectBtn.addEventListener('click', () => {
    currentRepoUrl = '';
    connectedFiles = [];
    if (gitRepoSection) gitRepoSection.style.display = 'grid';
    if (gitFileSection) gitFileSection.style.display = 'none';
    if (gitRepoUrl) gitRepoUrl.value = '';
  });
}

// Push to GitHub
const gitPushBtn = document.getElementById('git-push-btn');
const gitFilename = document.getElementById('git-filename');
const gitCommitMsg = document.getElementById('git-commit-msg');

if (gitPushBtn && gitFilename && gitCommitMsg) {
  gitPushBtn.addEventListener('click', async () => {
    if (!currentRepoUrl) {
      await window.dialog.alert('Not Connected', 'Please connect to a repository first');
      return;
    }

    const filename = gitFilename.value.trim();
    const commitMsg = gitCommitMsg.value.trim();

    if (!filename) {
      await window.dialog.alert('Missing Filename', 'Please enter a filename');
      return;
    }

    if (!markdownInput) {
      await window.dialog.alert('No Content', 'No content to push');
      return;
    }

    gitPushBtn.disabled = true;
    gitPushBtn.textContent = 'Pushing...';
    
    const result = await ipcRenderer.invoke('git-push', {
      repoUrl: currentRepoUrl,
      filename: filename.endsWith('.md') ? filename : `${filename}.md`,
      content: markdownInput.value,
      commitMsg: commitMsg || 'Update from Markedit'
    });
    
    if (result.success) {
      await window.dialog.alert('Success', result.message);
      // Clear commit message after successful push
      gitCommitMsg.value = '';
    } else {
      await window.dialog.alert('Push Failed', `Error: ${result.error}`);
    }
    
    gitPushBtn.disabled = false;
    gitPushBtn.textContent = 'Push to GitHub';
  });
}

// Run initialization when DOM is ready
const bootstrap = () => {
  try { initializeApp(); } catch (e) { console.error('initializeApp failed:', e); }
  try { initEmojiPicker(); } catch (e) { console.error('initEmojiPicker failed:', e); }
  try { initGitIntegration(); } catch (e) { console.error('initGitIntegration failed:', e); }
  try { if (window.i18n && i18n && typeof i18n.init === 'function') i18n.init().catch(e => console.warn('i18n init failed:', e)); } catch (e) { console.warn('i18n bootstrap failed:', e); }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

