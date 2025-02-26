class Repos {
    constructor(app, spinner) {
        this.app = app;
        this.template = document.querySelector('#repoItem');
        this.menuTemplate = document.querySelector('#menuItem');
        this.repos = [];
        this.repoCount = 0;
        this.spinner = spinner;
    }
    setupRepos() {
        this.app.add_repo_button.addEventListener('click', () => {
            this.addRepoInput(this.app.add_repo_url.value).then(() => {
                this.openRepos();
                this.openMenuRepos();
                this.saveRepos();
                this.app.add_repo_url.value = '';
            });
        });
        this.openMenuRepos();
        fs.readFile(appData + '/sources.txt', 'utf8', (err, data) => {
            if (!err) {
                let done = () => {
                    this.openMenuRepos();
                    this.app.toggleLoader(false);
                    if (this.repos.length) {
                        this.openRepo(this.repos[0]);
                    }
                };
                setTimeout(() =>
                    Promise.all(data.split('\n').map(url => this.addRepo(url)))
                        .then(done)
                        .catch(done)
                );
            }
        });
    }
    deleteRepo(index) {
        const cachePath = path.join(
            appData,
            'sources',
            md5(this.repos[index].url) + '.json'
        );
        if (fs.existsSync(cachePath)) {
            fs.unlinkSync(cachePath);
        }
        this.repos.splice(index, 1);
        this.repoCount--;
        this.app.showStatus('Repo Deleted!!');
    }
    saveRepos() {
        fs.writeFile(
            appData + '/sources.txt',
            this.repos.map(d => d.url).join('\n'),
            err => {
                if (err) alert('Failed to write sources.txt:' + err);
            }
        );
    }
    openMenuRepos() {
        this.app.menu_container.innerHTML = '';
        this.repos.sort((a, b) => a.order - b.order);
        this.repos.forEach((r, i) => {
            let child = this.menuTemplate.content.cloneNode(true);
            child.querySelector('.menu-name').innerText = r.name;
            child.querySelector('.menu-icon').src = r.url + 'icons/' + r.icon;
            let menu_item_inner = child.querySelector('.menu-item-inner');
            menu_item_inner.dataset.tooltip = r.body.repo.description;
            menu_item_inner.addEventListener('click', () => this.openRepo(r));
            this.app.menu_container.appendChild(child);
        });
        M.Tooltip.init(document.querySelectorAll('.tooltipped'), {});
    }
    async openRepo(repo) {
        this.app.current_data = repo;
        this.app.sync_songs.style.display = 'none';
        this.app.add_repo.style.display = 'none';
        this.app.sync_songs_now.style.display = 'none';
        this.app.container.innerHTML =
            '<h4 class="grey-text">Loading apps...</h4>';
        this.app.searchFilterContainer.style.display = 'block';
        this.app.title.innerHTML = repo.name;
        this.app.beatView.style.left = '-100%';
        this.app.apkInstall.style.display = 'none';
        this.app.browser_bar.style.display = 'none';
        this.app.searchFilter();
    }
    openRepos() {
        this.app.add_repo.style.display = 'block';
        this.app.sync_songs.style.display = 'none';
        this.app.sync_songs_now.style.display = 'none';
        this.app.container.innerHTML = '';
        this.app.searchFilterContainer.style.display = 'none';
        this.app.title.innerHTML = 'F-Droid Repos';
        this.app.beatView.style.left = '-100%';
        this.app.apkInstall.style.display = 'block';
        this.app.apkInstall.innerHTML =
            'Drag an APK file over this window to install. See Setup to get started.';
        this.app.browser_bar.style.display = 'none';
        this.repos.forEach((r, i) => {
            let child = this.template.content.cloneNode(true);
            child.querySelector('.repo-description').innerText =
                r.name + ' - ' + r.url;
            child.querySelector('.repo-image').src = r.url + 'icons/' + r.icon;
            child
                .querySelector('.delete-repo')
                .addEventListener('click', () => {
                    this.deleteRepo(i);
                    this.saveRepos();
                    this.openRepos();
                    this.openMenuRepos();
                });
            // child.querySelector('.update-repo').addEventListener('click',()=>{
            //     let url = r.url;
            //     this.deleteRepo(i);
            //     this.addRepoInput(url)
            //         .then(()=>{
            //             this.saveRepos();
            //             this.openRepos();
            //             this.openMenuRepos();
            //         });
            //
            // });
            this.app.container.appendChild(child);
        });
    }
    isValidRepo(repo) {
        if (!repo) return false;
        if (!repo.repo) return false;
        if (
            !repo.repo.version ||
            !(repo.repo.version > 17 && repo.repo.version < 24)
        )
            return false;
        return true;
    }
    addRepoInput(url) {
        this.app.toggleLoader(true);
        return this.addRepo(url)
            .then(() => {
                this.app.toggleLoader(false);
                this.app.showStatus('Repo added.');
            })
            .catch(error => {
                alert(error);
                this.app.toggleLoader(false);
                this.app.showStatus('Problem adding repo...', true);
            });
    }
    addRepo(url) {
        this.spinner.setMessage(`Loading ${url}`);
        let index = ++this.repoCount;
        url = url.trim();
        if (url[url.length - 1] !== '/') {
            url += '/';
        }
        return new Promise(async (resolve, reject) => {
            if (~this.repos.map(d => d.url).indexOf(url)) {
                reject('Repo already added!');
            }
            const jsonUrl = url + 'index-v1.json';
            request(jsonUrl, (error, response, body) => {
                if (error) {
                    return reject(error);
                } else {
                    try {
                        let repo_body = JSON.parse(body);
                        if (!this.isValidRepo(repo_body)) {
                            reject('Repo not valid or unsupported version!');
                        } else {
                            resolve(repo_body);
                        }
                    } catch (e) {
                        return reject('JSON parse Error');
                    }
                }
            });
        }).then(repo => {
            this.repos.push({
                name: repo.repo.name,
                icon: repo.repo.icon,
                url: url,
                order: index,
                body: repo,
                categories: repo.apps
                    .reduce((a, b) => {
                        b.icon = url + 'icons/' + b.icon;
                        return a.concat(b.categories);
                    }, [])
                    .filter((v, i, self) => self.indexOf(v) === i),
            });
        });
    }
}
