// Supabase Configuration
// Ku dar URL-kaaga iyo API Key-gaaga halkan (Get these from supabase.com)
const SUPABASE_URL = 'https://oqopvdolhdkmpmvlbzjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb3B2ZG9saGRrbXBtdmxiempuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNTI5MDIsImV4cCI6MjA4NTYyODkwMn0.TroWa9694teacjjNqAoNFsU_CzyBYFm_Vk1_mCyVyHQ';
const supabase = (typeof window.supabase !== 'undefined') ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Gemini Configuration
// Gemini Configuration managed via Netlify Environment Variables

// Global project data
let projectsData = [];

// Project Loader
const loadProjects = async () => {
    const container = document.getElementById('projects-container');
    try {
        const response = await fetch('data/projects.json');
        projectsData = await response.json();

        // Only show first 4 on home page
        const displayProjects = projectsData.slice(0, 4);

        container.innerHTML = displayProjects.map(project => `
            <div class="glass-card rounded-2xl overflow-hidden border border-gray-800 hover:border-primary/50 transition duration-500 group">
                <div class="h-64 overflow-hidden relative">
                    <img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700" onerror="this.src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800'">
                    <div class="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-60"></div>
                    <div class="absolute top-4 left-4">
                        <span class="px-3 py-1 bg-primary text-dark text-[10px] font-bold rounded-full uppercase tracking-widest">${project.tag}</span>
                    </div>
                </div>
                <div class="p-8">
                    <h3 class="text-2xl font-bold mb-2 text-primary transition">${project.title}</h3>
                    <p class="text-gray-500 text-sm mb-6 line-clamp-2">${project.description}</p>
                    <div class="flex flex-wrap gap-2 mb-8">
                        ${project.tech.map(t => `<span class="text-[10px] px-2 py-1 bg-dark/50 border border-gray-800 rounded text-gray-400">${t}</span>`).join('')}
                    </div>
                    <button onclick="handleViewDetails('${project.id}')" class="inline-flex items-center text-primary font-bold hover:underline transition">
                        View Details
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = '<p class="text-center text-gray-500">Failed to load projects.</p>';
    }
};

const showToast = (message) => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'bg-primary text-dark px-8 py-4 rounded-2xl font-bold shadow-2xl transform translate-y-10 opacity-0 transition-all duration-500 flex items-center space-x-3 border border-white/20';
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('toast-show'), 10);

    // Remove toast
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

window.handleViewDetails = (id) => {
    const project = projectsData.find(p => p.id === id);
    if (project && project.isComplete) {
        openProjectDetail(id);
    } else {
        showToast('🚀 Under Review | Dhawaan ayaan si rasmi ah u soo galin doonaa!');
    }
};

// Project Details Modal Logic
const initProjectModal = () => {
    const modal = document.getElementById('project-modal');
    const content = document.getElementById('modal-content');
    const closeBtn = document.getElementById('close-modal');
    const overlay = document.getElementById('modal-overlay');

    const closeModal = () => {
        content.classList.remove('modal-content-show');
        modal.classList.remove('modal-show');
        setTimeout(() => {
            modal.classList.add('pointer-events-none');
            document.body.classList.remove('modal-active');
        }, 300);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    window.openProjectDetail = (id) => {
        const project = projectsData.find(p => p.id === id);
        if (!project) return;

        // If project is not complete, show "Coming Soon"
        if (!project.isComplete) {
            alert(`${project.title} details are coming soon! | Faahfaahinta mashruucan dhawaan ayaad arki doontaa!`);
            return;
        }

        // Populate Modal Content
        document.getElementById('modal-title').innerText = project.title;
        document.getElementById('modal-tag').innerText = project.tag;
        document.getElementById('modal-desc-en').innerText = project.description_en || project.description;
        document.getElementById('modal-desc-so').innerText = project.description_so || project.description;

        // Main Image
        const mainImg = document.getElementById('modal-main-image');
        mainImg.src = project.image;

        // Tech Stack
        const techContainer = document.getElementById('modal-tech');
        techContainer.innerHTML = project.tech.map(t => `
            <span class="px-3 py-1 bg-dark/50 border border-gray-800 rounded text-gray-400 text-xs">${t}</span>
        `).join('');

        // Features
        const featuresContainer = document.getElementById('modal-features');
        const featuresEn = project.features_en || [];
        const featuresSo = project.features_so || [];

        featuresContainer.innerHTML = featuresEn.map((f, i) => `
            <li class="flex items-start space-x-3 text-sm">
                <svg class="h-5 w-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <div class="flex flex-col">
                    <span class="text-gray-200 font-medium">${f}</span>
                    <span class="text-gray-500 text-xs italic">${featuresSo[i] || ''}</span>
                </div>
            </li>
        `).join('');

        // Gallery/Thumbnails fix
        const thumbContainer = document.getElementById('modal-thumbnails');
        if (project.gallery && project.gallery.length > 0) {
            thumbContainer.innerHTML = project.gallery.map(img => `
                <div class="h-full w-24 shrink-0 rounded-lg overflow-hidden border border-gray-800 cursor-pointer hover:border-primary transition-all">
                    <img src="${img}" class="w-full h-full object-cover" 
                         onclick="document.getElementById('modal-main-image').src = '${img}'"
                         onerror="this.src='https://images.unsplash.com/photo-1555066932-5c673849cc51?auto=format&fit=crop&w=200'">
                </div>
            `).join('');
            thumbContainer.classList.remove('hidden');
        } else {
            thumbContainer.classList.add('hidden');
        }

        // Show Modal
        document.body.classList.add('modal-active');
        modal.classList.remove('pointer-events-none');
        modal.classList.add('modal-show');
        setTimeout(() => {
            content.classList.add('modal-content-show');
        }, 10);
    };
};

// AI Chat Logic
const initAIChat = () => {
    const toggle = document.getElementById('ai-chat-toggle');
    const chatWindow = document.getElementById('ai-chat-window');
    const close = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');

    // Enhanced Knowledge Base
    const responses = {
        somali: {
            hello: [
                "Asc! Sideen kuu caawin karaa maanta?",
                "Haye! Maxaa rabaa inaan kaaga sheego xirfadaha ama mashaariicda Mustaf?",
            ],
            about: [
                "Mustaf waa xirfadle ICT ah (Computer Science student) iyo Software Developer ku taakhsusay dhisidda nidaamyada casriga ah. Wuxuu aqoon durugsan u leeyahay Web Development (Frontend & Backend), Desktop Applications, iyo Database Design. Wuxuu dhisay mashaariic dhab ah oo hadda ka shaqeeya suuqa, isagoo xoogga saara tayada code-ka iyo UI/UX-ga.",
            ],
            skills: [
                "Mustaf wuxuu xirfad u leeyahay: HTML, CSS, JavaScript (Frontend), PHP & MySQL (Backend), iyo C# WinForms (.NET). Sidoo kale wuxuu aad ugu fiican yahay System Analysis iyo Database Design.",
                "Xirfadihiisa waxaa ka mid ah dhisidda nidaamyada Login-ka, CRUD systems, iyo soo saarista warbixinnada (PDF/Excel)."
            ],
            projects: [
                "Mustaf wuxuu dhisay mashaariic dhab ah sida: Business Management System (C#), School Management System, iyo website-yo ganacsi sida Gebiley Fragrance iyo Carfiye Perfumes.",
                "Mashaariicdiisa waxaa ka mid ah nidaamka maamulka iskuulada, nidaamka maamulka ganacsiga, iyo website-yo ay ku jiraan login iyo authentication."
            ],
            contact: [
                "Fadlan u gudub qaybta 'Contact' ee website-ka si aad fariin ugu reebto ama email ugu dirto: mustafupziye@gmail.com",
                "Waxaad Mustaf kala xiriiri kartaa mustafupziye@gmail.com. Aad ayuu ugu farxi doonaa inuu kula shaqeeyo!"
            ],
            default: [
                "Ma ku fahammin intaas, laakiin waxaan kuu sheegi karaa mashaariicda, xirfadaha, iyo aqoonta Mustaf ee ICT-ga.",
                "Fadlan weydii wax ku saabsan software-ka uu dhisay ama xirfadihiisa programming-ka."
            ]
        },
        english: {
            hello: [
                "Hello! How can I help you explore Mustaf's work today?",
                "Hi there! What would you like to know about Mustaf's development skills or projects?"
            ],
            about: [
                "Mustafa is a dedicated ICT Computer Science student and a versatile Software Developer. He specializes in creating robust web applications, desktop software, and efficient database systems. With experience in building real-world solutions currently used in the market, he is passionate about clean code and modern design principles.",
            ],
            skills: [
                "Mustaf is proficient in HTML, CSS, JavaScript, PHP & MySQL, and C# WinForms (.NET). He's also skilled in System Analysis, Database Design, and UI/UX.",
                "His technical expertise includes building authentication systems, CRUD applications, and generating complex reports in PDF or Excel formats."
            ],
            projects: [
                "He has completed several impressive projects, including a Business Management System (C#), a School Management System, and professional perfume websites like Gebiley Fragrance and Carfiye Perfumes.",
                "His portfolio includes robust systems with features like user authentication, relational databases, and data management tools."
            ],
            contact: [
                "You can reach out to Mustaf via the contact section below or directly at mustafupziye@gmail.com. He's always open to new opportunities!",
                "To hire Mustaf or collaborate on a project, please use the contact form or send an email to mustafupziye@gmail.com."
            ],
            default: [
                "I'm not quite sure about that. However, I can definitely tell you about Mustaf's software projects, coding skills, or education.",
                "Feel free to ask about the systems he has built or his technical background!"
            ]
        }
    };

    const addMessage = (text, isUser = false, isThinking = false) => {
        const div = document.createElement('div');
        div.className = isUser
            ? "bg-primary text-dark p-3 rounded-tl-xl rounded-bl-xl rounded-br-xl max-w-[85%] self-end ml-auto font-medium shadow-lg"
            : `bg-surface p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl max-w-[85%] border border-gray-800 self-start shadow-lg ${isThinking ? 'thinking-msg animate-pulse' : ''}`;

        div.innerText = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    };

    // Greeting message
    setTimeout(() => {
        if (messages.children.length === 0) {
            addMessage("Asc! I am Mustaf's AI Assistant. How can I help you? / Sideen kuu caawin karaa?");
        }
    }, 600);

    const getResponse = async (query) => {
        const somaliKeywords = ['asc', 'iska', 'warka', 'mustaf', 'mashruuc', 'xirfad', 'aqoon', 'maira', 'isii', 'sidee', 'yaryar', 'dhacay', 'war', 'haye', 'ayo', 'tahay', 'kumaad'];
        const isSomali = somaliKeywords.some(keyword => query.toLowerCase().includes(keyword));

        addMessage(isSomali ? "Mustaf AI ayaa fekeraya" : "Mustaf AI is thinking", false, true);

        try {
            console.log('Fetching AI response...');
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Server error: ${response.status} ${errorData.error || ''}`);
            }

            const data = await response.json();

            // Remove thinking animation
            const thinkingMsgs = document.querySelectorAll('.thinking-msg');
            thinkingMsgs.forEach(m => m.remove());

            return data.reply || (isSomali ? "Waan ka xumahay, hadda ma jawaabi karo." : "I apologize, I cannot respond right now.");
        } catch (error) {
            console.error("Critical AI Error:", error);
            const thinkingMsgs = document.querySelectorAll('.thinking-msg');
            thinkingMsgs.forEach(m => m.remove());
            return isSomali ? "Cillad: " + error.message : "Connection error: " + error.message;
        }
    };

    toggle.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        setTimeout(() => {
            chatWindow.classList.toggle('translate-y-10');
            chatWindow.classList.toggle('opacity-0');
        }, 10);
    });

    close.addEventListener('click', () => {
        chatWindow.classList.add('translate-y-10');
        chatWindow.classList.add('opacity-0');
        setTimeout(() => chatWindow.classList.add('hidden'), 300);
    });

    const handleSend = async () => {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, true);
        input.value = '';

        const responseText = await getResponse(text);
        addMessage(responseText);
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
};

// Smooth Navbar Scroll behavior
const handleNavbar = () => {
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('py-2');
            header.classList.remove('py-4');
        } else {
            header.classList.add('py-4');
            header.classList.remove('py-2');
        }
    });
};

// Community Feature Logic (Full Stack with Supabase)
const initCommunity = () => {
    const postBtn = document.getElementById('post-community-btn');
    const input = document.getElementById('community-input');
    const nameInput = document.getElementById('community-name');
    const feed = document.getElementById('community-feed');

    const getAvatar = (name, isAdmin) => {
        if (isAdmin || (name && name.toLowerCase().includes('mustaf'))) return "assets/images/Hero Image.jpeg";
        const seed = name || 'anon';
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
    };

    const fetchMessages = async () => {
        if (!supabase || SUPABASE_URL.includes('your-project')) {
            console.warn('Supabase not configured. Using mock data.');
            return [
                { id: 1, name: "Admin", text: "Fadlan ku xir Supabase si aad u aragto fariimaha dhabta ah.", likes: 0, isAdmin: true, created_at: new Date().toISOString() }
            ];
        }

        const { data, error } = await supabase
            .from('messages')
            .select('*, replies(*)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
        return data || [];
    };

    const renderMessages = async () => {
        feed.innerHTML = '<div class="text-center py-10"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>';

        const messages = await fetchMessages();
        const likedMessages = JSON.parse(localStorage.getItem('liked_messages') || '[]');

        if (messages.length === 0) {
            feed.innerHTML = '<p class="text-center text-gray-500 py-10">Fariin wali lama soo dhigin. Noqo qofka ugu horeeya!</p>';
            return;
        }

        feed.innerHTML = messages.map(msg => {
            const isLiked = likedMessages.includes(msg.id);
            const repliesHtml = (msg.replies || []).map(reply => `
                <div class="mt-4 ml-8 glass-card p-3 rounded-xl bg-dark/30 border border-gray-800/50">
                    <div class="flex items-center space-x-2 mb-1">
                        <img src="${getAvatar(reply.name, reply.isAdmin)}" class="w-6 h-6 rounded-full border border-primary/30 object-cover">
                        <span class="font-bold text-xs ${reply.isAdmin ? 'text-primary' : 'text-gray-300'}">${reply.name}</span>
                        <span class="text-[10px] text-gray-600">${new Date(reply.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="text-xs text-gray-400">${reply.text}</p>
                </div>
            `).join('');

            return `
                <div class="glass-card p-6 rounded-2xl border ${msg.isAdmin ? 'border-primary/30' : 'border-gray-800'} hover:border-primary/30 transition animate-fadeIn">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center space-x-3">
                            <img src="${getAvatar(msg.name, msg.isAdmin)}" class="w-10 h-10 rounded-full border border-primary/50 object-cover">
                            <div>
                                <h4 class="font-bold ${msg.isAdmin ? 'text-primary' : 'text-gray-200'}">${msg.name} ${msg.isAdmin ? '<span class="text-xs font-normal text-gray-500 ml-2 italic">Official</span>' : ''}</h4>
                                <p class="text-[10px] text-gray-600">${msg.isAdmin ? 'Admin' : 'Member'} • ${new Date(msg.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    <p class="text-gray-300 leading-relaxed mb-4">${msg.text}</p>
                    <div class="flex items-center space-x-6 text-sm mb-4">
                        <button onclick="handleLike(${msg.id}, ${msg.likes || 0})" class="flex items-center space-x-2 ${isLiked ? 'text-primary font-bold' : 'text-gray-500'} hover:text-primary transition group">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ${isLiked ? 'fill-primary' : 'group-hover:fill-primary'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>${msg.likes || 0} Likes</span>
                        </button>
                        <button onclick="toggleReplyForm(${msg.id})" class="flex items-center space-x-2 text-gray-500 hover:text-primary transition">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>${msg.replies ? msg.replies.length : 0} Replies</span>
                        </button>
                    </div>

                    <div id="reply-form-${msg.id}" class="hidden mt-4 pb-4 border-b border-gray-800">
                        <div class="flex flex-col space-y-3">
                            <input type="text" id="reply-name-${msg.id}" placeholder="Magacaaga..." class="bg-dark/30 border border-gray-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary text-gray-300">
                            <textarea id="reply-text-${msg.id}" rows="2" placeholder="Qor jawaabtaada..." class="bg-dark/30 border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-300"></textarea>
                            <div class="flex justify-end space-x-2">
                                <button onclick="toggleReplyForm(${msg.id})" class="text-[10px] text-gray-500 hover:text-gray-300">Cancel</button>
                                <button onclick="submitReply(${msg.id})" class="bg-primary text-dark px-3 py-1 rounded text-[10px] font-bold hover:bg-accent transition">Post Reply</button>
                            </div>
                        </div>
                    </div>

                    <div id="replies-${msg.id}">${repliesHtml}</div>
                </div>
            `;
        }).join('');
    };

    window.toggleReplyForm = (id) => {
        const form = document.getElementById(`reply-form-${id}`);
        form.classList.toggle('hidden');
    };

    window.submitReply = async (id) => {
        const text = document.getElementById(`reply-text-${id}`).value.trim();
        const name = document.getElementById(`reply-name-${id}`).value.trim() || 'Guest';

        if (!text) return alert("Fadlan qor jawaab!");

        const { error } = await supabase
            .from('replies')
            .insert([{ message_id: id, name, text, isAdmin: name.toLowerCase().includes('mustaf') }]);

        if (error) return alert("Cillad ayaa dhacday: " + error.message);

        renderMessages();
    };

    window.handleLike = async (id, currentLikes) => {
        const likedMessages = JSON.parse(localStorage.getItem('liked_messages') || '[]');
        if (likedMessages.includes(id)) return;

        const { error } = await supabase
            .from('messages')
            .update({ likes: currentLikes + 1 })
            .eq('id', id);

        if (error) return console.error(error);

        likedMessages.push(id);
        localStorage.setItem('liked_messages', JSON.stringify(likedMessages));
        renderMessages();
    };

    postBtn.addEventListener('click', async () => {
        const text = input.value.trim();
        const name = nameInput.value.trim() || 'Anonymous';

        if (!text) return alert("Fadlan qor fariin!");

        postBtn.disabled = true;
        postBtn.innerText = 'Posting...';

        const { error } = await supabase
            .from('messages')
            .insert([{ name, text, isAdmin: name.toLowerCase().includes('mustaf'), likes: 0 }]);

        postBtn.disabled = false;
        postBtn.innerText = 'Post Message';

        if (error) return alert("Cillad ayaa dhacday: " + error.message);

        input.value = '';
        nameInput.value = '';
        renderMessages();
    });

    renderMessages();
};

// Contact Form Handling
const initContactForm = () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const originalText = btn.innerText;

        btn.innerText = 'Sending...';
        btn.disabled = true;

        const formData = new FormData(form);
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                alert('Mahadsanid! Fariintaada si guul leh ayaa loogu diray Mustaf.');
                form.reset();
            } else {
                alert('Waan ka xumahay, cillad ayaa dhacday. Fadlan mar kale isku day.');
            }
        } catch (error) {
            alert('Cillad farsamo ayaa dhacday. Hubi internet-kaaga.');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
};

// Auto Theme Detection Logic
const initTheme = () => {
    const applyTheme = (e) => {
        if (e.matches) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            // Check if user has manual override, else default to light
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    };

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    query.addEventListener('change', applyTheme);
    applyTheme(query);
};

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadProjects();
    initProjectModal();
    initAIChat();
    handleNavbar();
    initCommunity();
    initContactForm();
});
