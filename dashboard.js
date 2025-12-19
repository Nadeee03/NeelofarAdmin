import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://cghcstaoyaguvuxkedys.supabase.co', // Replace with your URL
  'sb_publishable_ndl3AMemUASbTUt1WCAD3w_gC9iBiOj'                    // Replace with your anon public key
);

const routerInfo = {
  dashboard: {
    page: "./dashboard.html",
    title: "خانه | Neelofar Online Library",
  },
  notes: {
    page: "./notes.html",
    title: "یاداشت ها | Neelofar Online Library ",
  },
  talks: {
    page: "./talks.html",
    title: "گفتگو ها | Neelofar Online Library ",
  },
  special: {
    page: "./special.html",
    title: "ویژه نامه ها | Neelofar Online Library ",
  },
  podcast: {
    page: "./podcast.html",
    title: "پادکست | Neelofar Online Library ",
  },
  request: {
    page: "./request.html",
    title: "درخواست نامه | Neelofar Online Library ",
  },
  recommendations: {
    page: "./recommendations.html",
    title: "توصیه های ما | Neelofar Online Library ",
  },
  about: {
    page: "./about.html",
    title: "درباره ما | Neelofar Online Library ",
  },
  applications: {
    page: "./applications.html",
    title: " درخواست‌ها |Neelofar Online Library "
  }
};

const navLinks = document.querySelectorAll(".nav-link, .navlinks a");
const contentContainer = document.getElementById("main-content");

function changeUrlRoute(href) {
  window.history.pushState({ href }, "", `#${href}`);
  changePageContent(href);
}

async function changePageContent(href) {
  const route = routerInfo[href];
  if (!route) return;

  const { page, title } = route;

  try {
    const res = await fetch(page);
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const newContent = doc.querySelector("#main-content") || doc.body;

    contentContainer.innerHTML = newContent.innerHTML;
    initializePageScripts(href);

    document.title = title;

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${href}`) {
        link.classList.add("active");
      }
    });
  } catch (err) {
    contentContainer.innerHTML = "<p>خطا در بارگذاری محتوا</p>";
    console.error(err);
  }
}

navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const href = link.getAttribute("href").substring(1);
    changeUrlRoute(href);
  });
});

window.addEventListener("popstate", (e) => {
  const href = e.state?.href || "dashboard";
  changePageContent(href);
});

window.addEventListener("DOMContentLoaded", () => {
  const initialRoute = location.hash ? location.hash.substring(1) : "dashboard";
  changePageContent(initialRoute);
});


const monthsDari = ["حمل", "ثور", "جوزا", "سرطان", "اسد", "سنبله", "میزان", "عقرب", "قوس", "جدی", "دلو", "حوت"];
const weekdaysDari = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه"
];

function toJalali(gy, gm, gd) {
  let g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy > 1600 ? 979 : 0;
  gy -= gy > 1600 ? 1600 : 621;

  let gy2 = gm > 2 ? gy + 1 : gy;
  let days = 365 * gy + Math.floor((gy2 + 3) / 4)
    - Math.floor((gy2 + 99) / 100)
    + Math.floor((gy2 + 399) / 400)
    - 80 + gd + g_d_m[gm - 1];

  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  let jd = days < 186 ? 1 + (days % 31) : 1 + ((days - 186) % 30);

  return { jy, jm, jd };
}

function initializePageScripts(href) {
  if (href === 'notes') {
    const form = document.getElementById('authorForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const content = document.getElementById('description').value;
        const writer = document.getElementById('authorName').value;
        const title = document.getElementById('bookName').value;
        const id = document.getElementById('id').value;
        const image = document.getElementById('bookPhoto').files[0];
        const rawDate = document.getElementById('date').value;
        const d = new Date(rawDate);

        // weekday in Dari
        const weekday = weekdaysDari[d.getDay()];

        // Jalali conversion
        const j = toJalali(
          d.getFullYear(),
          d.getMonth() + 1,
          d.getDate()
        );

        // Final format: weekday day month year
        const date = `${weekday},  ${j.jd} ${monthsDari[j.jm - 1]} ${j.jy}`;


        let bookUrl = '';

        if (image) {
          const imagePath = `images/${Date.now()}_${image.name}`;
          const { error: imageError } = await supabase.storage.from('notes').upload(imagePath, image);
          if (!imageError) {
            bookUrl = supabase.storage.from('notes').getPublicUrl(imagePath).data.publicUrl;
          } else {
            alert('Image upload failed: ' + imageError.message);
            return;
          }
        }

        const { error: insertError } = await supabase.from('notes').insert({
          content,
          image: bookUrl,
          writer,
          title,
          id,
          date,
        });

        if (insertError) {
          alert('Post failed: ' + insertError.message);
        } else {
          alert('Post uploaded successfully!');
          form.reset();
        }
      });
    }

    const deleteBtn = document.getElementById("deleteBtn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        document.getElementById("deleteModal").classList.remove("hidden");
      });
    }

    const cancelDelete = document.getElementById("cancelDelete");
    if (cancelDelete) {
      cancelDelete.addEventListener("click", () => {
        document.getElementById("deleteModal").classList.add("hidden");
        document.getElementById("deleteBookName").value = '';
      });
    }

    const confirmDelete = document.getElementById("confirmDelete");
    if (confirmDelete) {
      confirmDelete.addEventListener("click", async () => {
        const bookName = document.getElementById("deleteBookName").value.trim();

        if (!bookName) {
          alert("لطفاً نام کتاب را وارد کنید");
          return;
        }

        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('title', bookName)
          .limit(1);

        if (error) {
          alert("خطا در دریافت داده: " + error.message);
          return;
        }

        if (!data || data.length === 0) {
          alert("کتابی با این نام پیدا نشد.");
          return;
        }

        const { error: deleteError } = await supabase
          .from('notes')
          .delete()
          .eq('title', bookName);

        if (deleteError) {
          alert("خطا در حذف کتاب: " + deleteError.message);
        } else {
          alert(`کتاب "${bookName}" با موفقیت حذف شد.`);
          document.getElementById("deleteModal").classList.add("hidden");
          document.getElementById("deleteBookName").value = '';
          location.reload();
        }
      });
    }
  }

  if (href === 'talks') {
    const form = document.getElementById('talksForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const content = document.getElementById('talksDescription').value;
        const writer = document.getElementById('talksAuthor').value;
        const title = document.getElementById('talksTitle').value;
        const id = document.getElementById('talksId').value;
        const image = document.getElementById('talksPhoto').files[0];
        const rawDate = document.getElementById('talksDate').value;
        const d = new Date(rawDate);

        // weekday in Dari
        const weekday = weekdaysDari[d.getDay()];

        // Jalali conversion
        const j = toJalali(
          d.getFullYear(),
          d.getMonth() + 1,
          d.getDate()
        );

        // Final format: weekday day month year
        const date = `${weekday},  ${j.jd} ${monthsDari[j.jm - 1]} ${j.jy}`;

        let bookUrl = '';

        if (image) {
          const imagePath = `images/${Date.now()}_${image.name}`;
          const { error: imageError } = await supabase.storage.from('talks').upload(imagePath, image);
          if (!imageError) {
            bookUrl = supabase.storage.from('talks').getPublicUrl(imagePath).data.publicUrl;
          } else {
            alert('خطا در بارگذاری عکس: ' + imageError.message);
            return;
          }
        }

        const { error: insertError } = await supabase.from('talks').insert({
          content,
          image: bookUrl,
          writer,
          title,
          id,
          date,
        });

        if (insertError) {
          alert('خطا در افزودن: ' + insertError.message);
        } else {
          alert('کتاب با موفقیت افزوده شد!');
          form.reset();
        }
      });
    }

    const deleteBtn = document.getElementById('deleteTalksBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        document.getElementById('deleteTalksModal').classList.remove('hidden');
      });
    }

    const cancelDelete = document.getElementById('cancelTalksDelete');
    if (cancelDelete) {
      cancelDelete.addEventListener('click', () => {
        document.getElementById('deleteTalksModal').classList.add('hidden');
        document.getElementById('deleteTalksTitle').value = '';
      });
    }

    const confirmDelete = document.getElementById('confirmTalksDelete');
    if (confirmDelete) {
      confirmDelete.addEventListener('click', async () => {
        const bookName = document.getElementById('deleteTalksTitle').value.trim();

        if (!bookName) {
          alert('لطفاً نام کتاب را وارد کنید');
          return;
        }

        const { data, error } = await supabase
          .from('talks')
          .select('id')
          .eq('title', bookName)
          .limit(1);

        if (error) {
          alert('خطا در دریافت داده: ' + error.message);
          return;
        }

        if (!data || data.length === 0) {
          alert('کتابی با این نام پیدا نشد.');
          return;
        }

        const bookId = data[0].id;

        const { error: deleteError } = await supabase
          .from('talks')
          .delete()
          .eq('id', bookId);

        if (deleteError) {
          alert('خطا در حذف کتاب: ' + deleteError.message);
        } else {
          alert(`کتاب "${bookName}" با موفقیت حذف شد.`);
          document.getElementById('deleteTalksModal').classList.add('hidden');
          document.getElementById('deleteTalksTitle').value = '';
          location.reload();
        }
      });
    }
  }


  if (href === 'special') {
    const form = document.getElementById('specialForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const content = document.getElementById('specialDescription').value;
        const writer = document.getElementById('specialAuthor').value;
        const title = document.getElementById('specialTitle').value;
        const id = document.getElementById('specialId').value;
        const image = document.getElementById('specialPhoto').files[0];
        const pdfFile = document.getElementById('specialPDF').files[0];
        const rawDate = document.getElementById('specialDate').value;
        const d = new Date(rawDate);

        // weekday in Dari
        const weekday = weekdaysDari[d.getDay()];

        // Jalali conversion
        const j = toJalali(
          d.getFullYear(),
          d.getMonth() + 1,
          d.getDate()
        );

        // Final format: weekday day month year
        const date = `${weekday},  ${j.jd} ${monthsDari[j.jm - 1]} ${j.jy}`;


        let bookUrl = '', pdfUrl = '';

        if (image) {
          const imagePath = `images/${Date.now()}_${image.name}`;
          const { error: imageError } = await supabase.storage.from('special').upload(imagePath, image);
          if (!imageError) {
            bookUrl = supabase.storage.from('special').getPublicUrl(imagePath).data.publicUrl;
          } else {
            alert('Image upload failed: ' + imageError.message);
            return;
          }
        }

        if (pdfFile) {
          const pdfPath = `files/${Date.now()}_${pdfFile.name}`;
          const { error: pdfError } = await supabase.storage.from('special').upload(pdfPath, pdfFile);

          if (!pdfError) {
            pdfUrl = supabase.storage.from('special').getPublicUrl(pdfPath).data.publicUrl;
          } else {
            alert('PDF upload failed: ' + pdfError.message);
            return;
          }
        }

        const { error: insertError } = await supabase.from('special').insert({
          content,
          image: bookUrl,
          writer,
          title,
          id,
          date,
          pdfLink: pdfUrl,
        });

        if (insertError) {
          alert('Post failed: ' + insertError.message);
        } else {
          alert('Post uploaded successfully!');
          form.reset();
        }
      });
    }

    const deleteBtn = document.getElementById("deleteSpecialBtn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        document.getElementById("deleteSpecialModal").classList.remove("hidden");
      });
    }

    const cancelDelete = document.getElementById("cancelSpecialDelete");
    if (cancelDelete) {
      cancelDelete.addEventListener("click", () => {
        document.getElementById("deleteSpecialModal").classList.add("hidden");
        document.getElementById("deleteSpecialTitle").value = '';
      });
    }

    const confirmDelete = document.getElementById("confirmSpecialDelete");
    if (confirmDelete) {
      confirmDelete.addEventListener("click", async () => {
        const bookName = document.getElementById("deleteSpecialTitle").value.trim();

        if (!bookName) {
          alert("لطفاً نام کتاب را وارد کنید");
          return;
        }

        const { data, error } = await supabase
          .from('special')
          .select('*')
          .eq('title', bookName)
          .limit(1);

        if (error) {
          alert("خطا در دریافت داده: " + error.message);
          return;
        }

        if (!data || data.length === 0) {
          alert("کتابی با این نام پیدا نشد.");
          return;
        }

        const { error: deleteError } = await supabase
          .from('special')
          .delete()
          .eq('title', bookName);

        if (deleteError) {
          alert("خطا در حذف کتاب: " + deleteError.message);
        } else {
          alert(`کتاب "${bookName}" با موفقیت حذف شد.`);
          document.getElementById("deleteSpecialModal").classList.add("hidden");
          document.getElementById("deleteSpecialTitle").value = '';
          location.reload();
        }
      });
    }
  }

  if (href === 'podcast') {
    const form = document.getElementById('podcastForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const content = document.getElementById('podcastDescription').value;
        const writer = document.getElementById('podcastAuthor').value;
        const title = document.getElementById('podcastTitle').value;
        const id = document.getElementById('podcastId').value;
        const image = document.getElementById('podcastImage').files[0];
        const audioFile = document.getElementById('podcastAudio').files[0];
        const rawDate = document.getElementById('podcastDate').value;
        const d = new Date(rawDate);

        // weekday in Dari
        const weekday = weekdaysDari[d.getDay()];

        // Jalali conversion
        const j = toJalali(
          d.getFullYear(),
          d.getMonth() + 1,
          d.getDate()
        );

        // Final format: weekday day month year
        const date = `${weekday},  ${j.jd} ${monthsDari[j.jm - 1]} ${j.jy}`;

        let imageUrl = '', audioUrl = '';

        if (image) {
          const imagePath = `images/${Date.now()}_${image.name}`;
          const { error: imageError } = await supabase.storage.from('podcast').upload(imagePath, image);
          if (!imageError) {
            imageUrl = supabase.storage.from('podcast').getPublicUrl(imagePath).data.publicUrl;
          } else {
            alert('Image upload failed: ' + imageError.message);
            return;
          }
        }

        if (audioFile) {
          const audioPath = `audios/${Date.now()}_${audioFile.name}`;
          const { error: audioError } = await supabase.storage.from('podcast').upload(audioPath, audioFile);
          if (!audioError) {
            audioUrl = supabase.storage.from('podcast').getPublicUrl(audioPath).data.publicUrl;
          } else {
            alert('Audio upload failed: ' + audioError.message);
            return;
          }
        }

        const { error: insertError } = await supabase.from('podcast').insert({
          content,
          writer,
          title,
          id,
          date,
          image: imageUrl,
          audioLink: audioUrl,
        });

        if (insertError) {
          alert('Post failed: ' + insertError.message);
        } else {
          alert('Podcast uploaded successfully!');
          form.reset();
        }
      });
    }

    const deleteBtn = document.getElementById("podcastDeleteBtn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        document.getElementById("podcastDeleteModal").classList.remove("hidden");
      });
    }

    const cancelDelete = document.getElementById("podcastCancelDelete");
    if (cancelDelete) {
      cancelDelete.addEventListener("click", () => {
        document.getElementById("podcastDeleteModal").classList.add("hidden");
        document.getElementById("podcastDeleteTitle").value = '';
      });
    }

    const confirmDelete = document.getElementById("podcastConfirmDelete");
    if (confirmDelete) {
      confirmDelete.addEventListener("click", async () => {
        const title = document.getElementById("podcastDeleteTitle").value.trim();

        if (!title) {
          alert("لطفاً نام پادکست را وارد کنید");
          return;
        }

        const { data, error } = await supabase
          .from('podcast')
          .select('*')
          .eq('title', title)
          .limit(1);

        if (error) {
          alert("خطا در دریافت داده: " + error.message);
          return;
        }

        if (!data || data.length === 0) {
          alert("پادکستی با این نام پیدا نشد.");
          return;
        }

        const { error: deleteError } = await supabase
          .from('podcast')
          .delete()
          .eq('title', title);

        if (deleteError) {
          alert("خطا در حذف پادکست: " + deleteError.message);
        } else {
          alert(`پادکست "${title}" با موفقیت حذف شد.`);
          document.getElementById("podcastDeleteModal").classList.add("hidden");
          document.getElementById("podcastDeleteTitle").value = '';
          location.reload();
        }
      });
    }
  }

  if (href === 'request') {
    const form = document.getElementById('specialRequestForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const province = document.getElementById('specialProvince').value.trim();
        const startDate = document.getElementById('specialStartDate').value;
        const endDate = document.getElementById('specialEndDate').value;
        const isOpenInput = document.getElementById('specialIsOpen').value === 'true';
        const description = document.getElementById('specialDescription').value;

        function formatDariDate(inputDate) {
          const d = new Date(inputDate);
          const weekday = weekdaysDari[d.getDay()];
          const j = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());

          return `${weekday} ${j.jd} ${monthsDari[j.jm - 1]} ${j.jy}`;
        }

        const startDateText = formatDariDate(startDate);
        const endDateText = formatDariDate(endDate);
        const dateText = `از ${startDateText} تا ${endDateText}`;

        const now = new Date();
        const end = new Date(endDate);

        const isStillOpen = end >= now && isOpenInput;


        try {
          const { data: existing, error: checkError } = await supabase
            .from('provinces')
            .select('id')
            .eq('provinces', province);

          if (checkError) throw checkError;

          if (existing.length > 0) {
            const { error: deleteError } = await supabase
              .from('provinces')
              .delete()
              .eq('provinces', province);

            if (deleteError) throw deleteError;
          }

          const { error: insertError } = await supabase.from('provinces').insert([
            {
              provinces: province,
              open: isStillOpen,
              date: dateText,
              description: description
            }
          ]);

          if (insertError) {
            console.error(' Error inserting province:', insertError.message);
            alert('خطا در ثبت اطلاعات');
          } else {
            alert(' ولایت با موفقیت ثبت شد!');
            document.getElementById('specialRequestForm').reset();
          }
        } catch (err) {
          console.error(' Unexpected error:', err);
          alert('خطا در ثبت اطلاعات');
        }
      });

    }
  }

  if (href === 'recommendations') {
    const form = document.getElementById('recAuthorForm');
    if (form) {
      // Form submission
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const category = document.getElementById('recCategory').value;
        const description = document.getElementById('recDescription').value;
        const authorName = document.getElementById('recAuthorName').value;
        const bookName = document.getElementById('recBookName').value;
        const genre = document.getElementById('recGenre').value;
        const translator = document.getElementById('recTranslator').value;
        const publisher = document.getElementById('recPublisher').value;
        const authorImage = document.getElementById('recAuthorPhoto').files[0];
        const bookImage = document.getElementById('recBookPhoto').files[0];

        let authorUrl = '', bookUrl = '';

        // Upload author image
        if (authorImage) {
          const imagePath = `images/${Date.now()}_${authorImage.name}`;
          const { error: imageError } = await supabase.storage.from('uploads').upload(imagePath, authorImage);
          if (!imageError) {
            authorUrl = supabase.storage.from('uploads').getPublicUrl(imagePath).data.publicUrl;
          } else {
            alert('Image upload failed: ' + imageError.message);
            return;
          }
        }

        // Upload book image
        if (bookImage) {
          const imagePath = `images/${Date.now()}_${bookImage.name}`;
          const { error: imageError } = await supabase.storage.from('uploads').upload(imagePath, bookImage);
          if (!imageError) {
            bookUrl = supabase.storage.from('uploads').getPublicUrl(imagePath).data.publicUrl;
          } else {
            alert('Image upload failed: ' + imageError.message);
            return;
          }
        }

        // Insert into Supabase
        const { error: insertError } = await supabase.from('recommendations').insert({
          category,
          description,
          authorImage: authorUrl,
          bookImage: bookUrl,
          authorName,
          bookName,
          genre,
          translator,
          publisher,
        });

        if (insertError) {
          alert('Post failed: ' + insertError.message);
        } else {
          alert('Post uploaded successfully!');
          document.getElementById('recAuthorForm').reset();
        }
      });

      // Show delete modal
      document.getElementById("recDeleteBtn").addEventListener("click", () => {
        document.getElementById("recDeleteModal").classList.remove("hidden");
      });

      // Cancel delete
      document.getElementById("recCancelDelete").addEventListener("click", () => {
        document.getElementById("recDeleteModal").classList.add("hidden");
        document.getElementById("recDeleteBookName").value = '';
      });

      // Confirm delete
      document.getElementById("recConfirmDelete").addEventListener("click", async () => {
        const bookName = document.getElementById("recDeleteBookName").value.trim();

        if (!bookName) {
          alert("لطفاً نام کتاب را وارد کنید");
          return;
        }

        const { data, error } = await supabase
          .from('recommendations')
          .select('*')
          .eq('bookName', bookName)
          .limit(1);

        if (error) {
          alert("خطا در دریافت داده: " + error.message);
          return;
        }

        if (!data || data.length === 0) {
          alert("کتابی با این نام پیدا نشد.");
          return;
        }

        const { error: deleteError } = await supabase
          .from('recommendations')
          .delete()
          .eq('bookName', bookName);

        if (deleteError) {
          alert("خطا در حذف کتاب: " + deleteError.message);
        } else {
          alert(`کتاب "${bookName}" با موفقیت حذف شد.`);
          document.getElementById("recDeleteModal").classList.add("hidden");
          document.getElementById("recDeleteBookName").value = '';
          location.reload();
        }
      });

    }
  }

  // Aplications
  if (href === 'applications') {
    const tableBody = document.querySelector("#applicationsTable tbody");
    if (!tableBody) return; // safe now, inside function

    async function loadApplications() {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      tableBody.innerHTML = "";

      data.forEach(app => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${app.name}</td>
        <td>${app.email}</td>
        <td>${app.province}</td>
        <td>${app.age}</td>
        <td>${app.education}</td>
        <td>${app.motivation}</td>
         <td>${app.experience}</td>
        <td>${app.status}</td>
        <td>
          <select onchange="updateStatus('${app.id}', this.value)">
            <option value="submitted">ثبت شده</option>
            <option value="under_review">در حال بررسی</option>
            <option value="accepted">قبول</option>
            <option value="rejected">رد</option>
          </select>
        </td>
      `;
        tableBody.appendChild(row);
      });
    }

    window.updateStatus = async (id, status) => {
      await supabase
        .from("applications")
        .update({ status })
        .eq("id", id);
    };

    loadApplications();
  }

}

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".navlinks");
  const navItems = document.querySelectorAll(".navlinks a");

  if (menuToggle && navLinks) {
    // Toggle menu when burger is clicked
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });

    // Close menu when any nav link is clicked
    navItems.forEach(link => {
      link.addEventListener("click", () => {
        if (navLinks.classList.contains("show")) {
          navLinks.classList.remove("show");
        }
      });
    });
  }
});









