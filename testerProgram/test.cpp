// compile with debug symbols

#include <iostream>
#include <unistd.h>
#include <sys/prctl.h>
#include <signal.h>

int main(int argc, char* argv[]) {
    pid_t pid;
    sleep(2);
    for(int i = 0; i < 3; i++) {
        pid = fork();
        if (pid == -1)
        {
            // If fork returns -1, there was an error!
            return 1;
        }
        else if(pid == 0) {
            prctl(PR_SET_PDEATHSIG, SIGHUP);
            while(true) {
                sleep(2);
                std::cout << "child process" << std::endl;
            }
        }
    }
    while(true) {
        std::cout << "parent process" << std::endl;

        sleep(2);
    }
}