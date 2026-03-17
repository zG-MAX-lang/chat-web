<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { toast } from 'vue-sonner'
import defaultAvatarImg from '~/assets/user-default.png'
// 寮曞叆鎵€闇€鐨勫浘鏍囷紝鏂板�炰簡 AtSign(鐢ㄤ簬ChatId) 鍜� Loader2(鍔犺浇鍔ㄧ敾)
import { Edit2, Bold, Italic, Smile, Image as ImageIcon, MapPin, User, ChevronDown, Check, AtSign, Loader2 } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const baseURL = 'http://localhost:8089'
const isSubmitting = ref(false)

// ================= 1. 鐢ㄦ埛鍩虹�€淇℃伅 =================
const userInfo = computed(() => ({
  nickName: authStore.savedUserInfo?.nickName || '鏈�鍛藉悕鐢ㄦ埛',
  chatId: authStore.savedUserInfo?.chatId || '0',
  avatar: authStore.savedUserInfo?.avatar || '',
  isDefaultAvatar: authStore.savedUserInfo?.isDefaultAvatar ?? true,
  sex: authStore.savedUserInfo?.sex ?? 0,
  areaName: authStore.savedUserInfo?.areaName || '',
  areaCode: authStore.savedUserInfo?.areaCode || '',
  personSignature: authStore.savedUserInfo?.personSignature || ''
}))

const userAvatar = computed(() => {
  if (userInfo.value.isDefaultAvatar) return defaultAvatarImg
  const avatar = userInfo.value.avatar
  if (!avatar) return defaultAvatarImg
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar
  return `${baseURL}${avatar.startsWith('/') ? avatar : `/${avatar}`}`
})

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = defaultAvatarImg
}

// 鉁� 鏍稿績淇�澶嶏細鍏ㄩ噺 Payload 鎷艰�呭伐鍘�
// 浣滅敤锛氭棤璁轰綘淇�鏀瑰摢涓�灞€閮ㄥ睘鎬э紝閮芥妸鍏朵粬鏈�淇�鏀圭殑灞炴€цˉ榻愶紝婊¤冻鍚庣�� VO 鐨勪弗鏍兼牎楠岋紒
const buildFullPayload = (overrides: Record<string, any> = {}) => {
  return {
    nickName: userInfo.value.nickName,
    sex: userInfo.value.sex,
    areaName: userInfo.value.areaName,
    areaCode: userInfo.value.areaCode,
    personSignature: userInfo.value.personSignature,
    chatId: userInfo.value.chatId,
    ...overrides // 鐢ㄤ紶鍏ョ殑鏂板€艰�嗙洊鎺夋棫鍊�
  }
}

// ================= 2. 涓�浜鸿祫鏂欑紪杈� =================
const showEditModal = ref(false)
const editForm = ref({
  nickName: '',
  sex: 0,
  areaName: '',
  areaCode: '',
})

const sexOptions = [
  { label: '涓嶅睍绀�', value: 0 },
  { label: '鐢�', value: 1 },
  { label: '濂�', value: 2 }
]

const regionData: Record<string, string[]> = {
  '鍖椾含甯�': ['鏈濋槼鍖�', '娴锋穩鍖�', '澶у叴鍖�', '涓滃煄鍖�'],
  '涓婃捣甯�': ['娴︿笢鏂板尯', '寰愭眹鍖�', '闈欏畨鍖�', '榛勬郸鍖�'],
  '骞夸笢鐪�': ['骞垮窞甯�', '娣卞湷甯�', '涓滆帪甯�', '浣涘北甯�'],
  '娴欐睙鐪�': ['鏉�宸炲競', '瀹佹尝甯�', '娓╁窞甯�', '鍢夊叴甯�'],
  '鍥涘窛鐪�': ['鎴愰兘甯�', '缁甸槼甯�', '鑷�璐″競', '瀹滃�惧競']
}
const mockAreaCodeMap: Record<string, string> = {
  '鏈濋槼鍖�': '110105', '娴锋穩鍖�': '110108', '娣卞湷甯�': '440300', '骞垮窞甯�': '440100', '鏉�宸炲競': '330100'
}

const availableProvinces = Object.keys(regionData)
const availableCities = ref<string[]>([])
const selectedProvince = ref('')
const selectedCity = ref('')

watch(selectedProvince, (newVal) => {
  availableCities.value = regionData[newVal] || []
  if (!availableCities.value.includes(selectedCity.value)) {
    selectedCity.value = availableCities.value[0] || ''
  }
})

const openEditModal = () => {
  editForm.value = {
    nickName: userInfo.value.nickName,
    sex: userInfo.value.sex,
    areaName: userInfo.value.areaName,
    areaCode: userInfo.value.areaCode,
  }
  if (userInfo.value.areaName) {
    const parts = userInfo.value.areaName.split('-')
    if (parts.length === 2) {
      selectedProvince.value = parts[0] || ''
      selectedCity.value = parts[1] || ''
    }
  }
  showEditModal.value = true
}

const handleSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    const newAreaName = selectedProvince.value && selectedCity.value ? `${selectedProvince.value}-${selectedCity.value}` : ''
    const newAreaCode = mockAreaCodeMap[selectedCity.value] || '000000'
      
    // 鉁� 浣跨敤宸ュ巶缁勮�呭叏閲忔暟鎹�鎻愪氦
    const payload = buildFullPayload({
      nickName: editForm.value.nickName,
      sex: editForm.value.sex,
      areaName: newAreaName,
      areaCode: newAreaCode
    })

    await authStore.updateProfile(payload)
    toast.success('涓�浜鸿祫鏂欏凡鏇存柊')
    showEditModal.value = false
  } catch (e) {
    // 閿欒��鐢� request 灞傛嫤鎴�澶勭悊
  } finally {
    isSubmitting.value = false
  }
}

// ================= 3. 瀵屾枃鏈�绛惧悕缂栬緫鍣� =================
const showSignatureModal = ref(false)
const signatureTemp = ref('')

const openSignatureEditor = () => {
  signatureTemp.value = userInfo.value.personSignature
  showSignatureModal.value = true
}

const saveSignature = async () => {
  if (isSubmitting.value) return
  try {
    isSubmitting.value = true
    // 鉁� 鍏ㄩ噺鎻愪氦
    await authStore.updateProfile(buildFullPayload({ personSignature: signatureTemp.value }))
    toast.success('绛惧悕宸叉洿鏂�')
    showSignatureModal.value = false
  } catch (e: any) {
  } finally {
    isSubmitting.value = false
  }
}

// ================= 4. 鍗曠嫭淇�鏀� Chat ID =================
const showChatIdModal = ref(false)
const chatIdTemp = ref('')

const openChatIdEditor = () => {
  chatIdTemp.value = String(userInfo.value.chatId)
  showChatIdModal.value = true
}

const saveChatId = async () => {
  if (isSubmitting.value) return
  // 鍩虹�€鏍￠獙锛氱‘淇濆彧鑳借緭鍏ユ暟瀛楋紝鍥犱负鍚庣��鏄� Long 绫诲瀷
  if (!/^\d+$/.test(chatIdTemp.value)) {
    toast.error('Chat ID 蹇呴』涓虹函鏁板瓧')
    return
  }
  try {
    isSubmitting.value = true
    // 鉁� 鍏ㄩ噺鎻愪氦锛屽苟寮哄埗杞�涓烘暟瀛楀彂缁欏悗绔�
    await authStore.updateProfile(buildFullPayload({ chatId: Number(chatIdTemp.value) }))
    toast.success('Chat ID 宸叉洿鏂�')
    showChatIdModal.value = false
  } catch (e: any) {
  } finally {
    isSubmitting.value = false
  }
}

// ================= 5. 搴曢儴瀵艰埅 Tabs =================
const activeTab = ref<'moments' | 'likes' | 'collections'>('moments')
const tabs = [
  { id: 'moments', label: '鍔ㄦ€�', count: 12 },
  { id: 'likes', label: '鎴戠殑鍠滄��', count: 128 },
  { id: 'collections', label: '鎴戠殑鏀惰棌', count: 45 }
]
</script>

<template>
  <div class="h-full overflow-y-auto bg-gray-50/30">
    <div class="max-w-[1100px] mx-auto p-4 sm:p-8">
      
      <header class="mb-8 relative">
        <div class="w-full h-48 md:h-64 rounded-3xl overflow-hidden relative bg-gradient-to-br from-indigo-100 via-purple-50 to-amber-50 border border-gray-100" />

        <div class="px-4 sm:px-10 flex flex-col md:flex-row md:items-end justify-between gap-6 relative -mt-16 md:-mt-20 z-10">
          <div class="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div class="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg shrink-0">
              <img :src="userAvatar" @error.once="handleImageError" class="w-full h-full object-cover">
            </div>

            <div class="text-center md:text-left mb-2 flex flex-col items-center md:items-start">
              <h1 class="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                {{ userInfo.nickName }}
                <span v-if="userInfo.sex === 1" class="text-blue-500 text-sm">鈾�</span>
                <span v-if="userInfo.sex === 2" class="text-pink-500 text-sm">鈾€</span>
              </h1>
              
              <div class="group relative flex items-center gap-1.5 cursor-pointer rounded-lg hover:bg-gray-100/80 p-1 -ml-1 transition-colors mb-2" @click="openChatIdEditor">
                <p class="text-gray-400 text-sm font-mono">@{{ userInfo.chatId }}</p>
                <button class="opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm p-1 rounded-full border border-gray-200">
                  <Edit2 class="w-3 h-3 text-gray-500" />
                </button>
              </div>
              
              <div class="group relative flex items-center gap-2 cursor-pointer rounded-lg hover:bg-gray-100/80 p-1.5 -ml-1.5 transition-colors" @click="openSignatureEditor">
                <p class="text-gray-600 text-sm max-w-[400px] truncate">
                  {{ userInfo.personSignature || '杩欎釜浜哄緢鎳掞紝鏆傛椂娌℃湁绛惧悕銆�' }}
                </p>
                <button class="opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm p-1 rounded-full border border-gray-200">
                  <Edit2 class="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
              
              <div class="flex items-center gap-1 text-gray-500 text-sm mt-1">
                <MapPin class="w-3.5 h-3.5" />
                <span>{{ userInfo.areaName || '鍦板尯鏈�璁剧疆' }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-center gap-3 mb-2">
            <button class="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-bold shadow-md transition-all active:scale-95" @click="openEditModal">
              缂栬緫璧勬枡
            </button>
          </div>
        </div>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500 font-medium">鑾疯禐</p>
          <p class="text-2xl font-bold text-slate-800 mt-1">0</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500 font-medium">绮変笣</p>
          <p class="text-2xl font-bold text-slate-800 mt-1">0</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500 font-medium">鍏虫敞</p>
          <p class="text-2xl font-bold text-slate-800 mt-1">0</p>
        </div>
      </section>

      <section class="mt-2">
        <div class="border-b border-gray-200">
          <nav class="flex gap-8 px-2">
            <button 
              v-for="tab in tabs" :key="tab.id"
              @click="activeTab = tab.id as any"
              class="relative py-4 text-[15px] font-medium transition-colors"
              :class="activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'"
            >
              {{ tab.label }} <span class="text-xs ml-1 text-gray-400">{{ tab.count }}</span>
              <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 w-full h-1 bg-slate-900 rounded-t-full" />
            </button>
          </nav>
        </div>

        <div class="py-12 flex flex-col items-center justify-center text-gray-400">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ImageIcon class="w-6 h-6 text-gray-300" />
          </div>
          <p>杩欓噷绌虹┖濡備篃锛屽揩鍘诲彂甯冪��涓€鏉″姩鎬佸惂</p>
        </div>
      </section>
    </div>

    <div v-if="showEditModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showEditModal = false" />

      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 class="text-xl font-bold text-gray-800">缂栬緫涓�浜鸿祫鏂�</h2>
          <button class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors" @click="showEditModal = false">
            <span class="text-gray-600 font-bold leading-none">&times;</span>
          </button>
        </div>

        <div class="p-6 flex flex-col gap-5">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700 flex items-center gap-2"><User class="w-4 h-4"/> 鏄电О</label>
            <input v-model="editForm.nickName" type="text" maxlength="8" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" placeholder="杈撳叆鏂扮殑鏄电О (鏈€闀�8瀛�)">
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700">鎬у埆</label>
            <div class="relative">
              <select v-model="editForm.sex" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all cursor-pointer">
                <option v-for="opt in sexOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <ChevronDown class="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700 flex items-center gap-2"><MapPin class="w-4 h-4"/> 鎵€鍦ㄥ湴鍖�</label>
            <div class="grid grid-cols-2 gap-3">
              <div class="relative">
                <select v-model="selectedProvince" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all cursor-pointer text-sm">
                  <option value="" disabled>閫夋嫨鐪佷唤/鍩庡競</option>
                  <option v-for="prov in availableProvinces" :key="prov" :value="prov">{{ prov }}</option>
                </select>
                <ChevronDown class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              
              <div class="relative">
                <select v-model="selectedCity" :disabled="!selectedProvince" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none appearance-none disabled:opacity-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all cursor-pointer text-sm">
                  <option value="" disabled>閫夋嫨甯傚尯</option>
                  <option v-for="city in availableCities" :key="city" :value="city">{{ city }}</option>
                </select>
                <ChevronDown class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div class="p-5 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <button class="px-6 py-2.5 rounded-full text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors" @click="showEditModal = false">鍙栨秷</button>
          <button class="px-6 py-2.5 rounded-full text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all active:scale-95 flex items-center gap-2" :disabled="isSubmitting" @click="handleSubmit">
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <span>{{ isSubmitting ? '淇濆瓨涓�...' : '淇濆瓨璧勬枡' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showChatIdModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showChatIdModal = false" />

      <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2"><AtSign class="w-4 h-4" /> 淇�鏀� Chat ID</h3>
          <button @click="showChatIdModal = false" class="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
        </div>
        
        <div class="p-5">
          <p class="text-xs text-gray-500 mb-3">Chat ID 鏄�鎮ㄧ殑鍞�涓€鏁板瓧鏍囪瘑锛屽彲鐢ㄤ簬濂藉弸鎼滅储銆�</p>
          <input 
            v-model="chatIdTemp" 
            type="text" 
            maxlength="10"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-mono text-sm" 
            placeholder="璇疯緭鍏ョ函鏁板瓧"
          >
        </div>

        <div class="p-4 pt-0 flex justify-end">
          <button class="px-5 py-2.5 rounded-full text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white shadow flex items-center gap-2 transition-all active:scale-95" :disabled="isSubmitting" @click="saveChatId">
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <span v-else><Check class="w-4 h-4 inline-block -mt-0.5" /></span>
            <span>纭�璁や慨鏀�</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSignatureModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showSignatureModal = false" />

      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2"><Edit2 class="w-4 h-4" /> 缂栬緫涓�鎬х�惧悕</h3>
          <button @click="showSignatureModal = false" class="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
        </div>
        
        <div class="p-4">
          <div class="flex items-center gap-2 mb-2 p-1 border border-gray-200 rounded-lg bg-gray-50">
            <button class="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="鍔犵矖 (妯℃嫙)"><Bold class="w-4 h-4" /></button>
            <button class="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="鏂滀綋 (妯℃嫙)"><Italic class="w-4 h-4" /></button>
            <div class="w-px h-4 bg-gray-300 mx-1"></div>
            <button class="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="鎻掑叆琛ㄦ儏"><Smile class="w-4 h-4" /></button>
          </div>
          
          <textarea 
            v-model="signatureTemp" 
            rows="4" 
            maxlength="50"
            class="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 resize-none text-sm text-gray-700" 
            placeholder="浠嬬粛涓€涓嬩綘鑷�宸�..."
          ></textarea>
          <div class="text-right text-xs text-gray-400 mt-1">{{ signatureTemp.length }} / 50</div>
        </div>

        <div class="p-4 pt-0 flex justify-end">
          <button class="px-5 py-2.5 rounded-full text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white shadow flex items-center gap-2 transition-all active:scale-95" :disabled="isSubmitting" @click="saveSignature">
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <span v-else><Check class="w-4 h-4 inline-block -mt-0.5" /></span>
            <span>纭�璁や繚瀛�</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>